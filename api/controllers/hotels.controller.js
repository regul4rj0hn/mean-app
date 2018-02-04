var dbconn = require('../data/dbconnection.js');
var ObjectId = require('mongodb').ObjectId;
var hotelData = require('../data/hotel-data.json');

module.exports.hotelsGetAll = function(req, res) {
    
    var db = dbconn.get();
    var collection = db.collection('hotels');
    
    var offset = 0;
    var count = 5;

    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }
    
    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }

    collection
        .find()
        .skip(offset)
        .limit(count)
        .toArray(function(err, docs) {
            console.log("GET all hotels:", docs);
            res
                .status(200)
                .json(docs);
    });
};

module.exports.hotelsGetOne = function(req, res) {
    var db = dbconn.get();
    var collection = db.collection('hotels');

    var hotelId = req.params.hotelId;

    collection
        .findOne({ _id: ObjectId(hotelId) }, function(err, doc) {
            console.log("GET one hotel with ID", hotelId);
            res
                .status(200)
                .json(doc);
    })
};

module.exports.hotelsAddOne = function(req, res) {
    var db = dbconn.get();
    var collection = db.collection('hotels');
    var newHotel = req.body;

    console.log("POST recieved for new Hotel, processing.");

    collection.insertOne(newHotel, function(err, response) {
        if (newHotel && newHotel.name && newHotel.stars) {
            newHotel.stars = parseInt(newHotel.stars, 10);
            console.log(response.ops);
            res
                .status(201)
                .json(response.ops);
        }
        else {
            console.log("Data missing on POST body.");
            res
                .status(400)
                .json({ message: "Required data missing on form body." });
        }
    });
};