var MongoClient = require('mongodb').MongoClient;
var mongodbURL = ' mongodb://<dbuser>:<dbpassword>@ds045021.mlab.com:45021/<dbname>';

var assert = require('assert');

var collection;

var VALIDATION_ERROR_CODES = {
    url: {
        empty: 'An URL is required.'
    }
};

function LinksClient() {
    MongoClient.connect(mongodbURL, {native_parser:true}, function(err, db) {
        assert.equal(null, err);

        console.log('Loading LinksClient.');
        collection = db.collection('links');
        assert.notEqual(null, collection);
    });
}

LinksClient.prototype.get = function() {
    return new Promise(function (resolve) {
        MongoClient.connect(mongodbURL, {native_parser:true}, function(err) {
            assert.equal(null, err);

            collection.find().sort({
                created: -1
            }).toArray(function (err, items) {
                resolve({
                    links: items
                });
            });
        });
    });
};

LinksClient.prototype.add = function(data) {
    return new Promise(function (resolve) {
        // Is url empty?
        if (!data.url || data.url.trim() === '') {
            return resolve({
                errors: {
                    url: VALIDATION_ERROR_CODES.url.empty
                }
            });
        }

        MongoClient.connect(mongodbURL, {native_parser: true}, function(err, db) {
            assert.equal(null, err);

            collection = db.collection('links');
            assert.notEqual(null, collection);

            collection.insert(data, function(err) {
                assert.equal(null, err);
            });

            resolve();
        });
    });
};

module.exports = LinksClient;
