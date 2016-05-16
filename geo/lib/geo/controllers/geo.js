var exports = module.exports;
var mongo = require('mongodb');
var bson = require("bson");
var ipaMetadata = require('ipa-metadata');
var parseApk = require('apk-parser');

var Server = mongo.Server,
    Db = mongo.Db;
var BSON = bson.BSONPure.BSON

var server = new Server('52.9.101.199', 27017, {
    auto_reconnect: true
});
db = new Db('geodb', server);

var activeSession
var currentAction
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

function insertEvent(geo, res) {
    geo.sid = new BSON.ObjectID(activeSession)
    geo.action = currentAction
    geo.type = geo.type ? geo.type : 'Network'
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

function parseIPA(path, app_id) {
    ipaMetadata(path, function (error, data) {
        var app_info = {
            status: 'PARSED',
            platform: 'iOS',
            name: data['metadata']['CFBundleName'],
            package: data['metadata']['CFBundleIdentifier']
        }
        console.log(app_info.name, app_info.package);
        db.collection('apps').update({
            '_id': new BSON.ObjectID(app_id)
        }, {
            $set: app_info
        }, function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log('parseIPA Success: ' + JSON.stringify(result));
            }
        });
    });
}

function parseAPK(path, app_id) {
    parseApk(path, function (error, data) {
        console.log('parseAPK', data['manifest'][0]['application']);
        var app_info = {
            status: 'PARSED',
            platform: 'Android',
            name: data['manifest'][0]['application'][0]['@android:name'],
            package: data['manifest'][0]['@package']
        }
        console.log(app_info.name, app_info.package);
        db.collection('apps').update({
            '_id': new BSON.ObjectID(app_id)
        }, {
            $set: app_info
        }, function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log('parseAPK Success: ' + JSON.stringify(result));
            }
        });
    });
}

exports.addApp = function (req, res) {
    var app = req.body;
    console.log('Adding App: ', req.files);
    var date_now = new Date()
    var serverPath = 'uploads/apps/' + date_now.getTime() + req.files.file.name;

    require('fs').rename(
        req.files.file.path,
        serverPath,
        function (err) {
            if (err) {
                console.log(err)
                res.send({
                    error: 'Error uploading app'
                });
                return;
            }
            console.log('Upload Success: ' + serverPath);
            var doc = {
                createdAt: date_now,
                path: serverPath,
                status: 'CREATED'
            }
            db.collection('apps').insert(doc, {}, function (err, result) {
                if (err) {
                    console.log(err)
                    res.send({
                        error: 'An error has occurred',
                    });
                } else {
                    console.log('Success: ' + JSON.stringify(result));
                    var r = result.ops[0]._id + ""
                    res.send(r);
                    var ext = serverPath.slice(-4)
                    if (ext == '.ipa')
                        parseIPA(serverPath, r)
                    else if (ext == '.apk')
                        parseAPK(serverPath, r)
                }
            });
        }
    );

};

exports.getApps = function (req, res) {
    var sel = {
        path: 0,
        createdAt: 0,
        status: 0
    }
    db.collection('apps', function (err, collection) {
        collection.find({}, sel).limit(50).sort({
            'createdAt': -1
        }).toArray(function (err, items) {
            console.log("count=", items.length, activeSession)
            if (err)
                res.send({
                    error: 'An error has occurred'
                });
            else
                res.send(items)
        });
    });
};

exports.getApp = function (req, res) {
    db.collection('apps', function (err, collection) {
        collection.find({
            _id: new BSON.ObjectID(req.params.id)
        }).toArray(function (err, items) {
            console.log("count=", items.length)
            if (err)
                res.send({
                    error: 'An error has occurred'
                });
            else
                res.send(items)
        });
    });
};

exports.apps = function (req, res) {
    console.log("-> apps");
    db.collection('apps').find().limit(50).sort({
        'createdAt': -1
    }).toArray(function (err, items) {
        console.log("Apps count=", items.length)
        var template = __dirname + '/../views/apps';
        res.render(template, {
            siteTitle: "Geo Testing",
            apps: items
        })
    });
};

exports.findById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving geo: ' + id);
    db.collection('actions').findOne({
        '_id': new BSON.ObjectID(id)
    }, function (err, item) {
        res.send(item);
    });
};

exports.setCurrentAction = function (req, res) {
    currentAction = req.body.action
    console.log('setCurrentAction: ' + currentAction);
    insertEvent({
            type: 'User'
        }, res)
        //res.send(currentAction);
};

exports.activateSession = function (req, res) {
    activeSession = req.body.sid
    console.log('Activated Session: ' + activeSession);
    res.send(activeSession);
};

exports.deactivateSession = function (req, res) {
    if (req.body.sid == activeSession) {
        activeSession = undefined
        currentAction = undefined
        console.log('De-Activated Session: ' + req.body.sid);
        res.send(req.body.sid);
    } else
        res.send({
            error: 'An error has occurred'
        });
};

exports.addSession = function (req, res) {
    var session = req.body;
    console.log('Adding Session: ' + JSON.stringify(session));
    var doc = {
        createdAt: new Date(),
        name: session.name,
        appName: session.appName,
        appID: new BSON.ObjectID(session.appID),
        deviceIp: session.deviceIp
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
                activeSession = result.ops[0]._id + ""
                res.send(activeSession);
            }
        });
    });
};

exports.getSessions = function (req, res) {
    db.collection('sessions', function (err, collection) {
        collection.find().limit(50).sort({
            'createdAt': -1
        }).toArray(function (err, items) {
            console.log("count=", items.length, activeSession)
            if (err)
                res.send({
                    error: 'An error has occurred'
                });
            else
                res.send(items)
        });
    });
};

exports.getSession = function (req, res) {
    db.collection('sessions', function (err, collection) {
        collection.find({
            _id: new BSON.ObjectID(req.params.id)
        }).toArray(function (err, items) {
            console.log("count=", items.length, activeSession)
            if (err)
                res.send({
                    error: 'An error has occurred'
                });
            else
                res.send(items)
        });
    });
};

exports.sessions = function (req, res) {
    console.log("-> sessions");
    db.collection('sessions').find().limit(50).sort({
        'createdAt': -1
    }).toArray(function (err, items) {
        console.log("count=", items.length, activeSession)
        for (var i = 0; i < items.length; ++i)
            if (items[i]._id == activeSession)
                items[i].active = true
        var template = __dirname + '/../views/sessions';
        res.render(template, {
            siteTitle: "Geo Testing",
            sessions: items,
            activeSession: activeSession
        })
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
var timeDiff = function (operand1, operand2) {
    return Math.round((operand1 - operand2) * 10000) / 10;
}
var formatBytes = function (bytes) {
    if (bytes == 0) return '0 bytes';
    var sizes = [' bytes', ' KB', ' MB', ' GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + sizes[i];
}

function getActions(session_id, excludes, cb) {
    console.log("getActions", session_id);
    db.collection('actions', function (err, collection) {
        collection.find({
            sid: new BSON.ObjectID(session_id),
            'request.host': {
                $nin: excludes
            }
        }).limit(50).sort({
            'request.timestamp_end': -1
        }).toArray(function (err, items) {
            if (err)
                cb(err, items)
            else {
                var _it = []
                for (var i = 0; i < items.length; ++i) {
                    _it.push({
                        requested_at: items[i].request.timestamp_start,
                        action: items[i].action,
                        url: items[i].request.host + items[i].request.path,
                        request_time: timeDiff(items[i].request.timestamp_end, items[i].request.timestamp_start),
                        execution_time: timeDiff(items[i].response.timestamp_start, items[i].request.timestamp_end),
                        response_time: timeDiff(items[i].response.timestamp_end, items[i].response.timestamp_start),
                        total_time: timeDiff(items[i].response.timestamp_end, items[i].request.timestamp_start),
                        response_size: formatBytes(items[i].response.contentLength)
                    })
                }
                cb(err, _it)
            }
        });
    });
}

exports.actions = function (req, res) {
    db.collection('sessions').find({
        _id: new BSON.ObjectID(req.query.sid)
    }).toArray(function (err, session) {
        if (err || session.length == 0) {
            res.send({
                error: "Session not Found"
            })
            return
        }

        var excludes = ['metxms.citrix.com', /[^.\s]+\.apple\.com/g]
        getActions(session[0]._id, excludes, function (err, items) {
            console.log("actions count", items.length, req.query.out);
            if (req.query.out == 'html') {
                var template = __dirname + '/../views/actions';
                res.render(template, {
                    siteTitle: "Geo Testing - " + session[0].name,
                    session: session[0],
                    excludes: excludes,
                    actions: items
                })
            } else
                res.json(items)
        })
    });


};

exports.addGeo = function (req, res) {
    if (!activeSession)
        res.send({
            'error': 'No active session!'
        });
    insertEvent(req.body, res);
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