var exports = module.exports;
var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('52.9.101.199', 27017, {auto_reconnect: true});
db = new Db('geodb', server);

var populateDB = function() {
    var actions = {
        "request": {
            "method": "flow.request.method",
            "scheme": "flow.request.scheme",
            "host": "flow.request.host",
            "path": "flow.request.path",
            "timestamp_start": "flow.request.timestamp_start",
            "timestamp_end": "flow.request.timestamp_end"
        },
        "response": {
            "status_code": "flow.response.status_code",
            "reason": "flow.response.reason",
            "timestamp_start": "flow.response.timestamp_start",
            "timestamp_end": "flow.response.timestamp_end",
            "contentLength": "len(flow.response.content)"
        }
    };

    db.collection('actions', function(err, collection) {
        collection.insert(actions, {safe:true}, function(err, result) {});
    });

};

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'geodb' database");
        db.collection('actions', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'actions' collection doesn't exist.");
            } else {
                collection.count(function(err, count) {
                    console.log("The 'actions' collection...", count);
                })
            }
        });

    } else
        console.log("Error connecting to 'geodb' database", err);
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving geo: ' + id);
    db.collection('actions', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('actions', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addGeo = function(req, res) {
    var geo = req.body;
    console.log('Adding geo: ' + JSON.stringify(geo));
    db.collection('actions', function(err, collection) {
        collection.insert(geo, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateGeo = function(req, res) {
    var id = req.params.id;
    var geo = req.body;
    console.log('Updating geo: ' + id);
    console.log(JSON.stringify(geo));
    db.collection('actions', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, geo, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating geo: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(geo);
            }
        });
    });
}

exports.deleteGeo = function(req, res) {
    var id = req.params.id;
    console.log('Deleting geo: ' + id);
    db.collection('actions', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

