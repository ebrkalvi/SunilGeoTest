var WebSocket = require('ws');
var router = require('express').Router({
    mergeParams: true
});
module.exports = router;

// Don't just use, but also export in case another module needs to use these as well.
router.callbacks = require('./controllers/farm');
router.models = require('./models');

router.get('/device', router.callbacks.getDevices);
router.get('/device/:id', router.callbacks.getDeviceInfo);

var ws
var reqId = 0

function sendRequest(sub, req) {
    var _req = {}
    _req.reqId = reqId++;
    _req.subject = sub
    _req.body = req
    ws.send(JSON.stringify(_req));
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
    console.log('-> message', data)
}

var connect = function () {
    ws = new WebSocket('ws://localhost:8080/');
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