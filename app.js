var express = require('express');
var path = require('path');
var routes = require('./api/routes');
var bodyParser = require('body-parser');

var app = express();

app.set('port', 3000);

// The order of the middleware functions in this file matters :)

// This is a logging function that will capture the requests, so it has to be on top.
app.use(function(req, res, next){
    console.log(req.method, req.url);
    next();
});

// Common static routing for the app
app.use(express.static(path.join(__dirname,'public')));

// Parses URLs into JSON
app.use(bodyParser.urlencoded({ extended: false }));

// Use the routes file with custom route for json /api
app.use('/api', routes);

// Server port config
var server = app.listen(app.get('port'), function() {
    var port = server.address().port;
    console.log('Listening on port: ' + port);
});