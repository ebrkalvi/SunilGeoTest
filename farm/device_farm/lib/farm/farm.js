var WebSocket = require('ws');
var router = require('express').Router({
    mergeParams: true
});
module.exports = router;

// Don't just use, but also export in case another module needs to use these as well.
router.callbacks = require('./controllers/farm');
router.models = require('./models');

router.post('/geo', router.callbacks.addGeo);
router.post('/geo/activateSession', router.callbacks.activateSession);
router.post('/geo/deactivateSession', router.callbacks.deactivateSession);
router.post('/geo/currentAction', router.callbacks.setCurrentAction);

router.get('/device', router.callbacks.getDevices);
router.get('/device/:id', router.callbacks.getDeviceInfo);

var ws
var reqId = 0

function sendRequest(sub, req) {
    var _req = {}
    _req.origin = 'Client'
    _req.reqId = reqId++;
    _req.subject = sub
    _req.body = req
    ws.send(JSON.stringify(_req));
}

function sendResponse(res) {
    var _res = res
    ws.send(JSON.stringify(_res));
}

function ws_open() {
    console.log('-> open')
    sendRequest('login', {
        uid: global.my_id,
        pwd: global.my_pwd
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
        } else {
            req.body = {
                error: 'Unkown Request'
            }
            sendResponse(req)
        }
    } else {
        console.error('Unknown origin', data, req)
    }
}

var connect = function () {
    //var SERVER = 'ws://52.9.101.199:8080/'
    var SERVER = 'ws://localhost:8080/'
    console.log('-> Connecting')
    ws = new WebSocket(SERVER);
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
