var express = require('express');
var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var Users = require('./Routes/Users');
var Weather = require('./Routes/Weather');

app.use('/users',Users);

app.use('/weather',Weather);

app.listen(port,function(){
    console.log("Server is running on port: "+port);
});
