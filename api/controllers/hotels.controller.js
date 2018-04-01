// To use the DB without mongoose (native driver)
//var dbconn = require('../data/dbconnection.js');
//var ObjectId = require('mongodb').ObjectId;
// To use a file instead:
//var hotelData = require('../data/hotel-data.json');
var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

var _splitArray = function(input) {
    if (input && input.length > 0) {
        return input.split(";");
    }
    else 
        return [];
};

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
    Hotel
        .create({
            name: req.body.name,
            description: req.body.description,
            stars: parseInt(req.body.stars, 10),
            services: _splitArray(req.body.services),
            photos: _splitArray(req.body.photos),
            currency: req.body.currency,
            location: {
                address: req.body.address,
                coordinates: [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            }
        }, function(err, hotel) {
            if (err) {
                console.log("Error creating hotel.");
                res
                .status(400)
                .json(err)
            }
            else {
                console.log("Hotel created: ", hotel)
                res
                  .status(201)
                  .json(hotel);                
            }
        });
};


module.exports.hotelsUpdateOne = function(req, res) {
    var hotelId = req.params.hotelId;
    console.log("PUT one hotel with ID", hotelId);

    Hotel
        .findById(hotelId)
        .select("-reviews -rooms")
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

            if (response.status !== 200) {
                res
                .status(response.status)
                .json(response.message);
            }
            else {
                doc.name = req.body.name;
                doc.description = req.body.description;
                doc.stars = parseInt(req.body.stars, 10);
                doc.services = _splitArray(req.body.services);
                doc.photos = _splitArray(req.body.photos);
                doc.currency = req.body.currency;
                doc.location = {
                    address: req.body.address,
                    coordinates: [
                        parseFloat(req.body.lng),
                        parseFloat(req.body.lat)
                    ]
                };

                doc.save(function(err, hotelUpdated) {
                    if (err) {
                        res
                          .status(500)
                          .json(err);
                    }
                    else {
                        res
                          .status(204)
                          .json();
                    }
                });
            }
        });
};