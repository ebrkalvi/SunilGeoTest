var MongoClient = require('mongodb').MongoClient;

var _db;
module.exports = {

    connectToServer: function (callback) {
        MongoClient.connect("mongodb://52.9.101.199:27017/geodb", function (err, db) {
            _db = db;
            //db.createCollection('register');
            db.createCollection('farms');
            return callback(err, db);
        });
    },

    getDb: function () {
        return _db;
    }
};