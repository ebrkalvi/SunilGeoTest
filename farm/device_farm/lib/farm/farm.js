var WebSocket = require('ws');
var pjson = require('../../package.json');
var router = require('express').Router({
    mergeParams: true
});
var exec = require('child_process').exec;
module.exports = router;

// Don't just use, but also export in case another module needs to use these as well.
router.callbacks = require('./controllers/farm');
router.models = require('./models');

router.post('/geo', router.callbacks.addGeo);
router.post('/geo/activateJob', router.callbacks.activateJob);
router.post('/geo/deactivateJob', router.callbacks.deactivateJob);
router.post('/geo/currentAction', router.callbacks.setCurrentAction);

router.get('/device', router.callbacks.getDevices);
router.get('/device/:id', router.callbacks.getDeviceInfo);

var ws
var requests = {}
var reqId = 0
var token

function ota() {
    var child = exec("git pull && forever restartall");
    child.stdout.on('data', function(data) {
        console.log(data)
    });
    child.stderr.on('data', function(data) {
        console.log(data)
    });
    child.on('close', function(code) {
        console.log(code)
    });
}

function sendRequest(sub, req, cb) {
    var _req = {
        origin: 'Client',
        token: token,
        reqId: reqId++,
        subject: sub,
        body: req
    }
    if (cb)
        requests[_req.reqId] = cb
    ws.send(JSON.stringify(_req), function ack(error) {
        if(error)
            console.log('-> sendRequest error', error)
    });
}

function sendResponse(res) {
    var _res = res
    ws.send(JSON.stringify(_res));
}

var keepAlive = function() {
    sendRequest('ping', {}, function(err, res) {
        console.log('-> ping cb', err, res)
        if(!err) {
            setTimeout(keepAlive, 1000 * 30);
        }
    })
}

function ws_open() {
    console.log('-> open', pjson.version)
    sendRequest('login', {uid: global.my_id, pwd: global.my_pwd, version: pjson.version}, function(err, res) {
        console.log('-> login cb', err, res)
        if(!err) {
            token = res.token
            keepAlive()
        } else {
            ws.close()
        }
    })
}

function ws_close() {
    console.log('-> close')
}

function ws_message(data, flags) {
    var req = JSON.parse(data)
    console.log('-> message', req)
    if (req.origin == 'Client') {
         console.error('Client callback', req)
         requests[req.reqId](req.err, req.body)
         delete requests[req.reqId]
    } else if (req.origin == 'Server') {
        if (req.subject == 'devices') {
            router.callbacks.getDevices(function (err, devices) {
                req.err = err
                req.body = devices
                sendResponse(req)
            })
        } else if (req.subject == 'device') {
            router.callbacks.getDeviceInfo(req.body.udid, function (err, info) {
                req.err = err
                req.body = info
                sendResponse(req)
            })
        } else if (req.subject == 'session') {
            router.callbacks.performSession(req.body, function (err, info) {
                req.err = err
                req.body = info
                sendResponse(req)
            })
        }  else if (req.subject == 'ota') {
            req.err = null
            req.body = null
            sendResponse(req)
            ota()
        } else {
            req.body = {error: 'Unkown Request'}
            sendResponse(req)
        }
    } else {
        console.error('Unknown origin', data, req)
    }
}

var connect = function () {
    console.log('-> Connecting')
    ws = new WebSocket(WS_SERVER);
    ws.on('open', ws_open);
    ws.on('message', ws_message);
    ws.on('error', function () {
        console.log('socket error');
    });
    ws.on('close', function () {
        ws_close()
        setTimeout(connect, 1000 * 6);
    });
};
connect();
