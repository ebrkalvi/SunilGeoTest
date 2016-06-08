var exports = module.exports;
var fs = require('fs');
var request = require('request');
var bson = require('bson');
var IDeviceManager = require('../models/idevicemanager');
var BSON = bson.BSONPure.BSON
var db = require('../../common/mongoUtil.js').getDb()

var deviceManager = new IDeviceManager()
exports.getDevices = function (cb) {
    deviceManager.list(function (err, devices) {
        console.log("-> getDevices", err, devices)
        cb(err, devices);
    })
};

exports.getDeviceInfo = function (udid, cb) {
    console.log("-> getDeviceInfo", udid)
    deviceManager.getDevice(udid).getInfo(function(err, info) {
        console.log("-> getDeviceInfo", err, info)
        cb(err, info);
    })
};

var sessions = {}
function downloadApp(app_id, path, cb) {
	if (!fs.existsSync(path)){
		fs.mkdirSync(path);
	}
	request({uri: 'http://localhost:3000/geo/app/'+app_id+'/bundle'})
	.on('response', function(response) {
		console.log(response.statusCode)
		console.log(response.headers['content-disposition'])
		var regexp = /filename=\"(.*)\"/gi;
        var filename = regexp.exec( response.headers['content-disposition'] )[1];
        if(filename) {
	        var fws = fs.createWriteStream( path + filename );
	        response.pipe( fws );
	        response.on( 'end', function() {
				cb(path + filename);
	        });
	    }
	})
	.on('error', function(err) {
		console.log(err)
	})
}

function downloadScript(script_id, path, cb) {
	if (!fs.existsSync(path)){
		fs.mkdirSync(path);
	}
	request({uri: 'http://localhost:3000/geo/script/'+script_id+'/bundle'})
	.on('response', function(response) {
		console.log(response.statusCode)
		console.log(response.headers['content-disposition']);
		var regexp = /filename=\"(.*)\"/gi;
        var filename = regexp.exec( response.headers['content-disposition'] )[1];
        if(filename) {
	        var fws = fs.createWriteStream( path + filename );
	        response.pipe( fws );
	        response.on( 'end', function() {
				cb(path + filename);
	        });
	    }
	})
	.on('error', function(err) {
		console.log(err)
	})
}

function runSesssion(session) {

}

function processSessions() {
	for(sid in sessions) {
		var session = sessions[sid]
		if(session.status == 'CREATED') {
			console.log('-> processSession', session)
			session.status = 'DOWNLOADING'
			var path = 'tmp/'+session.app_id+'/'
			downloadApp(session.app_id, path, function(app_path) {
				session.app_path = app_path
				console.log('-> downloadApp', session.app_path)
				path += session.script_id + '/'
				downloadScript(session.script_id, path, function(script_path) {
					session.script_path = script_path
					console.log('-> downloadScript', session.script_path)
					session.status = 'READY'
					runSesssion(session)
				})
			})
		}
	}
}

exports.performSession = function (session, cb) {
    console.log("-> performSession", session)
    for(var i = 0; i < session.length; ++i) {
	    if(!session[i].status)
	    	session[i].status = 'CREATED'
    	sessions[session._id] = session[i]
	}
    processSessions()
    cb(null, {res: 'Submitted'})
};

var activeSession

function insertEvent(geo, res) {
	geo.sid = new BSON.ObjectID(activeSession)
	geo.action = currentAction
	geo.type = geo.type ? geo.type : 'Network'
		console.log('Adding geo: ' + JSON.stringify(geo));
	db.collection('actions').insert(geo, function (err, result) {
		if (err) {
			res.send({'error': 'An error has occurred'});
		} else {
			console.log('Success: ', result);
			res.send(result.ops[0]._id);
		}
	});
}

exports.addGeo = function (req, res) {
	if (!activeSession)
		res.send({'error': 'No active session!'});
	else
		insertEvent(req.body, res);
}

exports.activateSession = function (req, res) {
	console.log('Activated Session: ', req.body);
	activeSession = req.body.sid
	res.send(activeSession);
};

exports.deactivateSession = function (req, res) {
	if (req.body.sid == activeSession) {
		activeSession = undefined
		currentAction = undefined
		console.log('De-Activated Session: ' + req.body.sid);
		res.send(req.body.sid);
	} else
		res.send({error: 'An error has occurred'});
};

exports.setCurrentAction = function (req, res) {
	currentAction = req.body.action
	console.log('setCurrentAction: ' + currentAction);
	insertEvent({type: 'User'}, res)
	//res.send(currentAction);
};

