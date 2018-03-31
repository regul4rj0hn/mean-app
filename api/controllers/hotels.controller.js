// To use the DB without mongoose (native driver)
//var dbconn = require('../data/dbconnection.js');
//var ObjectId = require('mongodb').ObjectId;
// To use a file instead:
//var hotelData = require('../data/hotel-data.json');
var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

var runGeoQuery = function(req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);

    if (isNaN(lng) || isNaN(lat)) {
        res
          .status(400)
          .json({ "message" : "If supplied in querystring, lng and lat must both be numbers" });
        return;
    }

    Hotel
        .aggregate([
            {
                $geoNear: {
                    near: [lng,lat],
                    distanceField: "dist.calculated",
                    maxDistance: 2000,
                    spherical: true,
                    num: 5
                }
            }
        ],
        function(err, results){
            if (err) {
                console.log("Error finding hotels");
                res
                  .status(500)
                  .json(err);
            } 
            else {
                res
                  .status(200)
                  .json(results);
            }
        });
};

module.exports.hotelsGetAll = function(req, res) {
    var offset = 0;
    var count = 5;
    var maxCount = 10;

    if (req.query && req.query.lat && req.query.lng) {
        runGeoQuery(req,res);
        return;
    }

    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }
    
    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }

    if (isNaN(offset) || isNaN(count)) {
        res
          .status(400)
          .json({ "message": "If supplied in query string, count and offset should be numbers" })
        return;
    }

    if (count > maxCount) {
        res
          .status(400)
          .json({ "message": "Count limit of " + maxCount + " exceeded" });
        return;
    }

    Hotel
        .find()
        .skip(offset)
        .limit(count)
        .exec(function(err, hotels) {
            if (err) {
                console.log("Error finding hotels");
                res
                  .status(500)
                  .json(err)
            }
            else {
                console.log("Found hotels", hotels.length);
                res
                  .json(hotels);
            }
        })
};

module.exports.hotelsGetOne = function(req, res) {
    var hotelId = req.params.hotelId;
    console.log("GET one hotel with ID", hotelId);

    Hotel
        .findById(hotelId)
        .exec(function(err, doc) {
            var response = {
                status: 200,
                message: doc
            }
            if (err) {
                console.log("Error finding hotels");
                response.status = 500;
                response.message = err;
            }
            else if (!doc) {
                response.status = 404;
                response.message = { "message": "Hotel ID not found" };
            }
            res
              .status(response.status)
              .json(response.message);
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