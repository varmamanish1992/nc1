var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = 3005;
var Client = require('node-rest-client').Client;
var ServiceCall = new Client();
var io = require('socket.io')(server);
//var Client = require('node-rest-client').Client;
//var ServiceCall = new Client();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Credentials', true);
    next();
});
 
var api = require('./API_Just')(app,io);

console.log("server now running on port", port);
server.listen(port);
 
