var exports = module.exports;
var mongo = require('mongodb');
var bson = require("bson");

var Server = mongo.Server,
    Db = mongo.Db;
var BSON = bson.BSONPure.BSON

var server = new Server('52.9.101.199', 27017, {
    auto_reconnect: true
});
db = new Db('geodb', server);

var activeSession
var populateDB = function () {
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

    db.collection('actions', function (err, collection) {
        collection.insert(actions, {
            safe: true
        }, function (err, result) {});
    });

};

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to 'geodb' database");
        db.collection('actions', {
            strict: true
        }, function (err, collection) {
            if (err) {
                console.log("The 'actions' collection doesn't exist.");
            } else {
                collection.count(function (err, count) {
                    console.log("The 'actions' collection...", count);
                })
            }
        });

        db.collection('sessions', {
            strict: true
        }, function (err, collection) {
            if (err) {
                console.log("The 'sessions' collection doesn't exist.");
            } else {
                collection.count(function (err, count) {
                    console.log("The 'sessions' collection...", count);
                })
            }
        });

    } else
        console.log("Error connecting to 'geodb' database", err);
});

exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving geo: ' + id);
    db.collection('actions', function (err, collection) {
        collection.findOne({
            '_id': new BSON.ObjectID(id)
        }, function (err, item) {
            res.send(item);
        });
    });
};

exports.activateSession = function (req, res) {
    activeSession = req.body.sid
    console.log('Activated Session: ' + activeSession);
    res.send(activeSession);
};

exports.addSession = function (req, res) {
    var session = req.body;
    console.log('Adding Session: ' + JSON.stringify(session));
    var doc = {
        createdAt: new Date(),
        name: session.name,
        appName: session.appName
    }
    db.collection('sessions', function (err, collection) {
        collection.insert(doc, {
            safe: true
        }, function (err, result) {
            if (err) {
                res.send({
                    error: 'An error has occurred'
                });
            } else {
                console.log('Success: ' + JSON.stringify(result));
                activeSession = result.ops[0]._id
                res.send(activeSession);
            }
        });
    });
};

exports.sessions = function (req, res) {
    db.collection('sessions', function (err, collection) {
        collection.find().limit(50).sort({
            'createdAt': -1
        }).toArray(function (err, items) {
            console.log("count=", items.length)
            for (var i = 0; i < items.length; ++i)
                if (items[i]._id == activeSession)
                    items[i].active = true
            var template = __dirname + '/../views/sessions';
            res.render(template, {
                welcomeMessage: "Welcome!",
                sessions: items,
                activeSession: activeSession
            })
        });
    });
};

exports.deleteSession = function (req, res) {
    var id = req.body.sid;
    console.log('Deleting session: ' + id);
    db.collection('sessions', function (err, collection) {
        collection.remove({
            '_id': new BSON.ObjectID(id)
        }, {
            safe: true
        }, function (err, result) {
            if (err) {
                res.send({
                    'error': 'An error has occurred - ' + err
                });
            } else {
                console.log('Sessions ' + result + ' document(s) deleted');
                db.collection('actions', function (err, collection) {
                    collection.remove({
                        'sid': new BSON.ObjectID(id)
                    }, {
                        safe: true
                    }, function (err, result) {
                        if (err) {
                            res.send({
                                'error': 'An error has occurred - ' + err
                            });
                        } else {
                            console.log('Actions' + result + ' document(s) deleted');
                            res.send(req.body);
                        }
                    });
                });
            }
        });
    });
};

exports.actions = function (req, res) {
    var cursor = db.collection('sessions').find({
        _id: new BSON.ObjectID(req.query.sid)
    });
    cursor.each(function (err, session) {
        if (!session)
            return
        console.log("actions", req.query.sid, err, session);
        var excludes = ['metxms.citrix.com', /[^.\s]+\.apple\.com/g]
        db.collection('actions', function (err, collection) {
            collection.find({
                sid: new BSON.ObjectID(req.query.sid),
                'request.host': {
                    $nin: excludes
                }
            }).limit(50).sort({
                'request.timestamp_end': -1
            }).toArray(function (err, items) {
                var template = __dirname + '/../views/actions';
                res.render(template, {
                    session: session,
                    excludes: excludes,
                    actions: items
                })
            });
        });
    });


};

exports.addGeo = function (req, res) {
    var geo = req.body;
    if (activeSession)
        geo.sid = new BSON.ObjectID(activeSession)
    console.log('Adding geo: ' + JSON.stringify(geo));
    db.collection('actions', function (err, collection) {
        collection.insert(geo, {
            safe: true
        }, function (err, result) {
            if (err) {
                res.send({
                    'error': 'An error has occurred'
                });
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateGeo = function (req, res) {
    var id = req.params.id;
    var geo = req.body;
    console.log('Updating geo: ' + id);
    console.log(JSON.stringify(geo));
    db.collection('actions', function (err, collection) {
        collection.update({
            '_id': new BSON.ObjectID(id)
        }, geo, {
            safe: true
        }, function (err, result) {
            if (err) {
                console.log('Error updating geo: ' + err);
                res.send({
                    'error': 'An error has occurred'
                });
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(geo);
            }
        });
    });
}

exports.deleteGeo = function (req, res) {
    var id = req.params.id;
    console.log('Deleting geo: ' + id);
    db.collection('actions', function (err, collection) {
        collection.remove({
            '_id': new BSON.ObjectID(id)
        }, {
            safe: true
        }, function (err, result) {
            if (err) {
                res.send({
                    'error': 'An error has occurred - ' + err
                });
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}