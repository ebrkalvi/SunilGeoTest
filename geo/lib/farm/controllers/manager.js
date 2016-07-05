var exports = module.exports;
var db = require('../../common/mongoUtil.js').getDb()
var crypto = require('crypto')

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    });

// initialization
var connections = {};
var listener = {}
var requests = {}

var reqId = 0

listener.ping = function(req, res, client) {
    res.body = {status: 0}
    client.send(JSON.stringify(res));
}

function sendRequest(conn, sub, req, cb) {
    var _req = {}
    _req.origin = 'Server'
    _req.reqId = reqId++;
    _req.subject = sub
    _req.body = req
    if (cb)
        requests[_req.reqId] = cb
    conn.send(JSON.stringify(_req), function ack(error) {
        console.log('-> sendRequest error', error)
    });
}

exports.showFarms = function (req, res) {
    console.log('-> showFarms', req.body)
    db.collection('farms').find({}, {pwd: 0}).toArray(function (err, farms) {
        console.log("Farms count", farms.length)
        for (var i = 0; i < farms.length; ++i) {
            var client = connections[farms[i].uid]
            farms[i].isOnline = client ? true : false
            if(client) {
                //console.log("Farm", i, client.version, farms[i].ip)
                farms[i].version = client.version
                farms[i].ip = client.ip
            }
        }
        var template = __dirname + '/../views/farms';
        res.render(template, {
            siteTitle: "Geo Testing",
            farms: farms
        })
    })
}

exports.showDevices = function (req, res) {
    console.log('-> showDevices', req.body, req.params)
    var template = __dirname + '/../views/devices';
    if (req.params.uid && connections.hasOwnProperty(req.params.uid)) {
        var conn = connections[req.params.uid]
        sendRequest(conn, 'devices', { action: 'List'}, function (result) {
            console.log('-> devices List', result)
            res.render(template, {
                siteTitle: "Geo Testing",
                uid: req.params.uid,
                devices: result
            })
        })
    } else {
        res.render(template, { siteTitle: "Geo Testing", devices: [] })
    }
}

exports.getDeviceInfo = function (req, res) {
    console.log('-> getDeviceInfo', req.params.uid, req.params.udid, req.body)
    if (req.params.uid && connections.hasOwnProperty(req.params.uid) && req.params.udid) {
        var conn = connections[req.params.uid]
        sendRequest(conn, 'device', {
            udid: req.params.udid
        }, function (result) {
            console.log('-> device info')
            res.status(200).json(result)
        })
    } else {
        res.status(200).json({})
    }
}

exports.register = function (req, res) {
    console.log('-> register', req.ip, req.body)
    var farm = {
        uid: req.body.my_id,
        status: 'PENDING',
        ip: req.ip,
        pwd: crypto.randomBytes(32).toString('hex'),
        registered_at: new Date()
    }
    db.collection('farms').update({uid: farm.uid}, farm, {
        safe: true,
        upsert: true
    }, function (err, result) {
        if (err) {
            res.status(200).json({err: err, status: -2});
        } else {
            res.status(200).json({pwd: farm.pwd, status: 0})
            //wss.notifyNewUser(user.phone)
        }
    })
}

exports.approve = function (req, res) {
    console.log('-> approve', req.ip, req.params, req.body)
    if(!req.body.name || !req.body.location) {
        res.status(200).json({err: "Name or Location cannot be empty", status: -1});
        return
    }
    var farm = {
        name: req.body.name,
        location: req.body.location,
        status: 'APPROVED'
    }
    db.collection('farms').update({uid: req.params.farm, status: 'PENDING'}, {$set: farm}, function (err, result) {
        if (err) {
            res.status(200).json({err: err, status: -2});
        } else {
            res.status(200).json({res: "Approved", status: 0})
        }
    })
}

exports.ota = function (req, res) {
    console.log('-> ota', req.ip, req.params, req.body)
    var client = connections[req.params.farm]
    if(client) {
        sendRequest(client, 'ota', {}, function(result) {
            res.status(200).json({status: 0});
        })
    } else {
        res.status(200).json({err: err, status: -2});
    }
}

exports.notifyNewFarm = function (uid) {
    db.collection('farms').find({
        uid: uid
    }, {
        uid: 1,
        _id: 0
    }).toArray(function (err, items) {
        console.log('notifyNewUser', err)
        var res = {
            subject: 'newUserAdded',
            newUser: number
        }
        for (var i = 0; i < items.length; i++) {
            var client = connections[items[i].uid];
            if (client)
                client.send(JSON.stringify(res));
        }
    });
}

exports.processPendingSessions = function() {
    db.collection('sessions').find({status: 'CREATED'}, {app_id: 1, script_id:1}).toArray(function (err, sessions) {
        console.log('processPendingSessions', err, sessions)
        for (var uid in connections) {
            var client = connections[uid];
            sendRequest(client, 'session', sessions, function(res) {
                console.log('Sessions submitted to', uid, res)
            })
        }
    });
}

exports.notifyNewSession = function (sid) {
    db.collection('sessions').findOne({_id: sid}, {app_id: 1, script_id:1, _id: 0 }, function (err, session) {
        console.log('notifyNewSession', err, session)
        exports.processPendingSessions()
    });
}

wss.broadcast = function broadcast(data, exclude) {
    wss.clients.forEach(function (client) {
        client.send(data);
    });
};
wss.on('connection', function connection(client) {
    console.log('Connected to', client.upgradeReq.headers['sec-websocket-key']);

    client.on('message', function incoming(message) {
        var req = JSON.parse(message)
        console.log('received', req.type, req.reqId, req.subject, client.upgradeReq.headers['sec-websocket-key']);
        if (req.origin == 'Server') {
            console.log('Callback', req)
            requests[req.reqId](req.body)
            delete requests[req.reqId]
        } else if (req.hasOwnProperty('reqId')) {
            var res = {
                origin: req.origin,
                reqId: req.reqId
            };
            if (req.subject == 'login') {
                var login = req.body
                db.collection('farms').findOne({uid: login.uid, pwd: login.pwd, status: 'APPROVED'}, {pwd: 0, _id: 0, uid: 0}, function (err, farm) {
                    console.log('farms.count: ', err, farm, login);
                    if (!err && farm && farm.ip) {
                        res.body = {status: 0, token: crypto.randomBytes(32).toString('hex')}
                        client.ip = farm.ip
                        client.version = login.version
                        client.uid = login.uid
                        client.token = res.body.token
                        connections[client.uid] = client
                        client.send(JSON.stringify(res));
                    } else {
                        res.status = -1
                        res.err = "Login Failed!"
                        client.send(JSON.stringify(res));
                        client.close()
                    }
                })
            } else {
                //console.log('sync_contacts', req.token, client.token)
                if (req.token != client.token) {
                    res.status = -2
                    res.err = "Login Failed!"
                    client.send(JSON.stringify(res));
                    client.close()
                    return;
                }

                if (listener.hasOwnProperty(req.subject)) {
                    listener[req.subject](req, res, client)
                } else {
                    console.log("Unknown subject!", req.subject)
                    res.status = -1
                    res.err = "Unknown subject!"
                    client.send(JSON.stringify(res));
                }
            }
        }
    });
    client.on('close', function () {
        console.log('closing', client.upgradeReq.headers['sec-websocket-key'])
        delete connections[client.uid];
    });
});