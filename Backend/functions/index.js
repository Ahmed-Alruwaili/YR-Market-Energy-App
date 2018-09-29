const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
var cors = require('cors');
var uuid = require('uuid');
const axios = require('axios');
var bodyParser = require("body-parser");
var app = express();
var port = process.env.PORT || 3000;

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

app.use(bodyParser.json());
var jsonParser = bodyParser.json();

app.get('/', (request, response) => {
    response.send(`${ Date.now() }`);
});

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
    //console.log(req.headers.last_name + ":");
    var locationName = locationOverallValue[1] + ",AU";
    var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + locationName + '&cnt=100&units=metric&APPID=908f958d6609dd37ee33114a87b81e1a';
    var respo = "test";
    
    // if(setWeatherLookupData(locationId, locationName)){
        if(setWeatherData(data.weatherData, locationId, locationValue)){
            response.send("Success");
        }
    // }
    
    response.send("Success");
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
