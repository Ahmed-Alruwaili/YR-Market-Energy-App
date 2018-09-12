var express = require('express');
var weather = express.Router();
var database = require('../db/database');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var token;
var request = require('request');

weather.use(cors());

process.env.SECRET_KEY = "projectdesign";

weather.post('/getData', function(req, res) {
    var date = new Date();
    var locationId = req.headers.first_name;
    //console.log(req.headers.last_name + ":");
    var locationName = req.headers.last_name + ",AU";

    database.connection.getConnection(function(err, connection) {
        if (err) {
        } else {

            console.log(locationName);
            connection.query('SELECT * FROM weather where suburbId = "' + locationId + '" order by 1 desc limit 1', function(err, rows, fields) {
                if (!err) {

                    try{
                        if(rows.length == 0){
                          request('http://api.openweathermap.org/data/2.5/forecast?q=' + locationName + '&cnt=100&units=metric&APPID=908f958d6609dd37ee33114a87b81e1a', function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var saveData = saveWeatherData(body, locationId);

                                if(saveData) {
                                  connection.query('SELECT * FROM weather order by 1 desc limit 1', function(errChild, rowChild, fieldChild) {
                                    if (!errChild) {
                                        res.status(200).json(rowChild);
                                    }else {
                                        res.status(204).json("Error Result");
                                    }
                                  });
                                } else {
                                    res.status(204).json("Error Result");
                                }
                            }
                          });
                        }

                        var dbDate = rows[0].created.getMonth() + "/" + rows[0].created.getDay() + "/" + rows[0].created.getYear();
                        var todayDate = date.getMonth() + "/" + date.getDay() + "/" + date.getYear();
                        if(dbDate != todayDate){
                            console.log("there");
                            request('http://api.openweathermap.org/data/2.5/forecast?q=' + locationName + '&cnt=100&units=metric&APPID=908f958d6609dd37ee33114a87b81e1a', function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    var saveData = saveWeatherData(body, locationId);

                                    if(saveData) {
                                        connection.query('SELECT * FROM weather order by 1 desc limit 1', function(errChild, rowChild, fieldChild) {
                                            if (!errChild) {
                                                res.status(200).json(rowChild);
                                            }else {
                                                res.status(204).json("Error Result");
                                            }
                                        });
                                        
                                    } else {
                                        res.status(204).json("Error Result");
                                    }
                                }
                            });
                        }else{
                            console.log("here");
                            res.status(200).json(rows);
                        }

                    }catch(ex){
                        res.status(204).json("Error Result");
                    }
                } else {
                    res.status(204).json("Error Result");
                }
            });
            connection.release();
        }
    });
});

weather.get('/getLocation', function(req, res) {

    var appData = {};

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM suburb', function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});

function saveWeatherData(weatherresult, suburbId){
  var today = new Date();
  var returnVal = true;
  var appData = {
      "error": 1,
      "data": ""
  };

  var weatherData = {
      "Data": weatherresult,
      "SuburbId": suburbId,
      "created": today
  }

  console.log(weatherData);

  database.connection.getConnection(function(err, connection) {
      if (err) {
        returnVal = false;
      } else {
          connection.query('INSERT INTO weather SET ?', weatherData, function(err, rows, fields) {
              if (err) {
                try{
                  returnVal = false;
                }catch(ex){

                }
              }
          });
          connection.release();
      }
  });

  process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
  });

  setTimeout(function () {
    console.log('This will still run.');
  }, 500);
  return returnVal;
}

function getSuburbLocation(locationId){
      var returnVal = "melbourne,VIC,AUS";
      var appData = {
          "error": 1,
          "data": ""
      };

      database.connection.getConnection(function(err, connection) {
          if (err) {
            returnVal = false;
          } else {
              connection.query('SELECT ActualValue FROM suburb WHERE Id = ?', [locationId], function(err, rows, fields) {
                  if (!err) {
                      try{
                        //console.log(rows[0].ActualValue);
                        returnVal = rows[0].ActualValue;
                      }catch(ex){

                      }
                      
                  }
              });
              connection.release();
          }
      });
      return returnVal;

}
module.exports = weather;
