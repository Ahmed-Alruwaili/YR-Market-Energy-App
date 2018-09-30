const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
var cors = require('cors');
const engines = require('consolidate');
var uuid = require('uuid');
const axios = require('axios');
var bodyParser = require("body-parser");
var app = express();
var port = process.env.PORT || 3000;

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

app.use(bodyParser.json());

var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// firebase.initializeApp(
//     functions.config().firebase
// );

var serviceAccount = require("./tools/serviceAccountKey.json");

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://yrenergymarket.firebaseio.com"
});

function getFacts(){
    const ref = firebaseApp.database().ref("object");
    return ref.once('value').then(snap => snap.val());
}

function getSuburbs(){
    const ref = firebaseApp.database().ref("suburbLocation");
    return ref.once('value').then(snap => snap.val());
}

function getStates(){
    const ref = firebaseApp.database().ref("states");
    return ref.once('value').then(snap => snap.val());
}

function getWeatherData(){
    const ref = firebaseApp.database().ref("weather");
    return ref.once('value').then(snap => snap.val());
}

function getWeatherLookupData(){
    const ref = firebaseApp.database().ref("weatherLookUp");
    return ref.once('value').then(snap => snap.val());
}

function setTest(){
    var userId = uuid.v1();
    firebase.database().ref('users/' + userId).set({
        username: "hisila",
        email: "hisihh@gmail.com",
        profile_picture : "test"
    }, function(error) {
        if (error) {
            return false;
        } else {
            return true;
        }
    });    
}

function setWeatherData(weatherresult, suburbId, locationName){
    var today = new Date();
    var returnVal = true;
  
    var weatherData = {
        "Data": weatherresult,
        "LocationName": locationName,
        "LocationId": suburbId,
        "created": today
    };
  
    var userId = uuid.v1();
    firebase.database().ref('weather/' + userId).set(weatherData, function(error) {
        if (!error) {
           return false;
        } else {
            return true;
        }
    });
}

function setWeatherLookupData(locationId, locationName){
    var today = new Date();
    var userId = uuid.v1();
    var returnval = true;
    var weatherLookupData = {
        "LocationName": locationName,
        "LocationId": locationId,
        "created": today
    };

    firebase.database().ref('weatherLookUp/' + userId).set(weatherLookupData, function(error) {
        if (!error) {
           return false;
        } else {
            return true;
        }
    });
}

function processAlgorithm(population, time, weather, day){
    var dayVal = 0;
    var weatherVal = 0;
    var timeVal = 0;
    var populationVal = 0;
    
    if(day == "Sunday" || day == "Saturday"){
        dayVal = 2;
    }else{
        if(time > 900 && time < 1700){
            timeVal = 1;
        }else{
            timeVal = 2;
        }
        dayVal = 1;
    }

    if(weather < 7){
        weatherVal = 4;
    }else if(weather < 14){
        weatherVal = 3;
    }else if(weather < 22){
        weatherVal = 2;
    }else if(weather > 30) {
        weatherVal = 4;
    }else if(weather <= 30) {
        weatherVal = 1;
    }

    if(population < 1000000){
        populationVal = 1;
    }else if(population < 3000000){
        populationVal = 2;
    }else if(population < 6000000){
        populationVal = 3;
    }else{
        populationVal = 4;
    }

    var calc = 0.1 * timeVal + 0.4 * weatherVal + 0.2 * populationVal + 0.3 * dayVal;

    return calc;    
}

app.use(bodyParser.json());
var jsonParser = bodyParser.json();

app.get('/', (request, response) => {
    response.render('index');
});

// app.get('/google7c1de9e14bc4124c.html', (request, response) => {
//     response.render('google7c1de9e14bc4124c.html');
// });

app.get('/suburbList', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getSuburbs().then(facts => {
        response.json(facts)
    })
});

app.get('/statesList', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    //setTest();
    getStates().then(facts => {
        response.json(facts)
    });
});

app.post('/testpost', urlencodedParser, (request, response) => {
    //console.log(request.body.id);
    if (!request.body) return response.sendStatus(400)
    response.send('welcome, ' + request.body.id)
});

app.post('/weather', urlencodedParser, (req, response) => {
    if (!req.body) return response.sendStatus(400);
    
    var date = new Date();
    var data = req.body;
    var locationOverallValue = data.id.split("-");
    var locationId = locationOverallValue[0];
    var locationValue = data.value;
    var population = data.population;
    var weather = data.weather;
    var time = data.time;
    var day = data.day;
    
    setWeatherData(data.weatherData, locationId, locationValue);
    var responsedata = processAlgorithm(population, time, weather, day);

    response.json({"success": true, "value": responsedata});
});

app.get('/weather', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    getStates().then(facts => {
        response.json(facts);
    });
});

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.https.onRequest(app);
