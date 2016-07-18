var WebSocket = require('ws');
var pjson = require('../../package.json');
var router = require('express').Router({
    mergeParams: true
});
const readline = require('readline');
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
    var child = exec("git pull && npm install && forever restartall");
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

var Promise = require('bluebird')
var adb = require('adbkit')
var client = adb.createClient()

// 
// adb shell ps|grep python
// adb shell su -c "/data/data/ru.meefik.linuxdeploy/files/bin/linuxdeploy start"
// adb shell su -c "/data/data/ru.meefik.linuxdeploy/files/bin/linuxdeploy shell 'nohup mitmdump -s /home/android/sunil/geotesting.py&'"
//
function isProxyRunning(cb) {
    client.listDevices()
      .then(function(devices) {
        //console.log('-> devices', devices)
        return Promise.map(devices, function(device) {
          return client.shell(device.id, 'ps|grep python')
            // Use the readAll() utility to read all the content without
            // having to deal with the events. `output` will be a Buffer
            // containing all the output.
            .then(adb.util.readAll)
            .then(function(output) {
              //console.log('[%s] %s', device.id, output.toString().trim())
              return output.toString().trim()
            })
        })
      })
      .then(function(res) {
        cb(null, res)
      })
      .catch(function(err) {
        cb(err, null)
      })
}

function startProxy(cb) {
    client.listDevices()
      .then(function(devices) {
        //console.log('-> devices', devices)
        return Promise.map(devices, function(device) {
          return client.shell(device.id, 'su -c "/data/data/ru.meefik.linuxdeploy/files/bin/linuxdeploy start"' + 
                ' && su -c "/data/data/ru.meefik.linuxdeploy/files/bin/linuxdeploy shell \'mitmdump -s /home/android/sunil/geotesting.py\' | grep Geo"')
            .then(function(stream) {
                console.log("-> Stream")
                const rl = readline.createInterface({input: stream});
                rl.on('line', function(d) {
                    var line = d.toString('utf8')
                    if(line.indexOf('Geo:') == 0) {
                        var req = {body: JSON.parse(line.substring(4))}
                        //console.log(req)
                        router.callbacks.addGeo(req, {send: function(b){console.log(b)}})
                    }
                    else
                        console.log("-> data", line)
                })
                stream.on('end', function() {
                    console.log("-> end")
                })
                //return adb.util.readAll(stream)
            })
            .then(function(output) {
              return "";//output.toString().trim()
            })
        })
      })
      .then(function(res) {
        cb(null, res)
      })
      .catch(function(err) {
        cb(err, null)
      })
}

var proxyStatus = "Unknown"
var keepAlive = function() {
    isProxyRunning(function(err, res) {
        console.log('-> isProxyRunning', err, res)
        if(!err && res.length > 0){
            proxyStatus = res[0] ? "Proxy is Up" : "Proxy is *Down*"
            if(!res[0])
                startProxy(function(err, res){
                    console.log('-> startProxy', err, res)
                })
        } else
            proxyStatus = err || "Proxy device not available"

        sendRequest('ping', {proxyStatus: proxyStatus}, function(err, res) {
            console.log('-> ping cb', err, res)
            if(!err) {
                setTimeout(keepAlive, 1000 * 30);
            }
        })
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
