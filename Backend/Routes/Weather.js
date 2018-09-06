var express = require('express');
var weather = express.Router();
var database = require('../db/database');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var token;
var request = require('request');

weather.use(cors());

process.env.SECRET_KEY = "projectdesign";

weather.get('/getData', function(req, res) {
    var date = new Date();

    database.connection.getConnection(function(err, connection) {
        if (err) {
        } else {
            connection.query('SELECT * FROM weather order by 1 desc limit 1', function(err, rows, fields) {
                if (!err) {

                    try{
                        var dbDate = rows[0].created.getMonth() + "/" + rows[0].created.getDay() + "/" + rows[0].created.getYear();
                        var todayDate = date.getMonth() + "/" + date.getDay() + "/" + date.getYear();
                        if(dbDate != todayDate){
                            console.log("there");
                            request('http://api.openweathermap.org/data/2.5/forecast?q=Melbourne,AU&cnt=100&units=metric&APPID=908f958d6609dd37ee33114a87b81e1a', function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    var saveData = saveWeatherData(body);

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

function saveWeatherData(weatherresult){
      var today = new Date();
      var returnVal = true;
      var appData = {
          "error": 1,
          "data": ""
      };

      var weatherData = {
          "Data": weatherresult,
          "created": today
      }

      database.connection.getConnection(function(err, connection) {
          if (err) {
            returnVal = false;
          } else {
              connection.query('INSERT INTO weather SET ?', weatherData, function(err, rows, fields) {
                  if (err) {
                      returnVal = false;
                  }
              });
              connection.release();
          }
      });
      return returnVal;

}
module.exports = weather;
