var MongoClient = require('mongodb').MongoClient;

var dburl = 'mongodb://localhost:27017/meanhotel';
var _connection = null;

var open = function() {
    MongoClient.connect(dburl, function(err, database) {
       if (err) {
           console.log('DB Connection failed.')
           return;
       }
        _connection = database.db('meanhotel');
        console.log('DB Connection successful', database);
    });
};

var get = function() {
    return _connection;
};

module.exports = {
    open: open,
    get: get
};