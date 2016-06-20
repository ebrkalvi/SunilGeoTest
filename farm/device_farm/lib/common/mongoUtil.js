var MongoClient = require('mongodb').MongoClient;

var _db;
module.exports = {

    connectToServer: function (callback) {
        MongoClient.connect("mongodb://52.9.101.199:27017/geodb", function (err, db) {
            _db = db;
            console.log("Connected to 'geodb' database");
            //db.createCollection('farms');
            db.collection('farms').count(function (err, count) {
                console.log("The 'farms' collection...", count);
                db.collection('farms').createIndex({"uid": 1}, {unique: true})
            })
            db.collection('actions').count(function (err, count) {
                console.log("The 'actions' collection...", err, count);
            })
            db.collection('sessions').count(function (err, count) {
                console.log("The 'sessions' collection...", err, count);
            });
            db.collection('jobs').count(function (err, count) {
                console.log("The 'jobs' collection...", count);
                db.collection('jobs').createIndex({"farm_id":1, "session_id": 1}, {unique: true})
            })
            return callback(err, db);
        });
    },

    getDb: function () {
        return _db;
    }
};