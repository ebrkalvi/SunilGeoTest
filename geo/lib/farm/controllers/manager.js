var exports = module.exports;
var db = require('./mongoUtil.js').getDb()
var crypto = require('crypto')

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    });

// initialization
var connections = {};

var listener = {}
//listener.

exports.notifyNewUser = function (number) {
    db.collection('users').find({
        contacts: {
            $elemMatch: {
                $eq: number
            }
        }
    }, {
        phone: 1,
        _id: 0
    }).toArray(function (err, items) {
        console.log('notifyNewUser', err)
        var res = {
            subject: 'newUserAdded',
            newUser: number
        }
        for (var i = 0; i < items.length; i++) {
            var client = connections[items[i].phone];
            if (client)
                client.send(JSON.stringify(res));
        }
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
        if (req.hasOwnProperty('reqId')) {
            var res = {
                reqId: req.reqId
            };
            if (req.subject == 'login') {
                var login = req.body
                db.collection('users').find({
                    phone: login.number,
                    pwd: login.pwd
                }).count(function (err, count) {
                    console.log('user.count: ', err, count, client.upgradeReq.headers['sec-websocket-key']);
                    if (count == 1) {
                        res.status = 0
                        res.token = crypto.randomBytes(32).toString('hex')
                        client.number = login.number
                        client.token = res.token
                        connections[client.number] = client
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
                    listener[req.subject](req, client)
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
        delete connections[client.number];
    });
});
