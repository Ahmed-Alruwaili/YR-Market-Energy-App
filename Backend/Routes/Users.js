var express = require('express');
var users = express.Router();
var database = require('../db/database');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var token;
var request = require('request');

users.use(cors());

process.env.SECRET_KEY = "projectdesign";

users.post('/register', function(req, res) {

    var today = new Date();
    var appData = {
        "error": 1,
        "data": ""
    };

    var userData = {
        "first_name": req.headers.first_name,
        "last_name": req.headers.last_name,
        "email": req.headers.email,
        "password": req.headers.password,
        "created": today
    }

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["status"] = 500;
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('INSERT INTO users SET ?', userData, function(err, rows, fields) {
                if (!err) {
                    appData["status"] = 0;
                    appData["error"] = 0;
                    appData["data"] = "User registered successfully!";
                    res.status(201).json(appData);
                } else {
                    appData["status"] = 400;
                    appData["error"] = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                }
            });
            connection.release();
        }
    });
});

users.post('/login', function(req, res) {

    var appData = {};
    var email = req.headers.email;
    var password = req.headers.password;

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
                if (err) {
                    appData["error"] = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        if (rows[0].password == password) {
                            let token = jwt.sign(rows[0], process.env.SECRET_KEY, {
                                expiresIn: 1440
                            });
                            appData["error"] = 0;
                            appData["token"] = token;
                            res.status(200).json(appData);
                        } else {
                            appData["error"] = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(400).json(appData);
                        }
                    } else {
                        appData["error"] = 1;
                        appData["data"] = "Email does not exists!";
                        res.status(400).json(appData);
                    }
                }
            });
            connection.release();
        }
    });
});

users.use(function(req, res, next) {
    next();
});

users.get('/getUsers', function(req, res) {

    var appData = {};

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users', function(err, rows, fields) {
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

module.exports = users;
