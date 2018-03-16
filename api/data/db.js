var mongoose = require('mongoose')

var dburl = 'mongodb://localhost:27017/meanhotel';

mongoose.connect(dburl);

mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to: ' + dburl);
});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected from: ' + dburl);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose run into an error: ' + err);
});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose connection forcibly terminated.');
        process.exit(0);
    });
});

process.on('SIGTERM', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose connection forcibly terminated.');
        process.exit(0);
    });
});

process.once('SIGUSR2', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose connection is restarting.');
        process.kill(process.pid, 'SIGUSR2');
    });
});

// Schemas and Models
require('./hotels.model.js')