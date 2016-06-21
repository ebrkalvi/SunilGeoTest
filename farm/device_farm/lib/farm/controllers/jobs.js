var exports = module.exports;
var fs = require('fs');
var exec = require('child_process').exec;
var request = require('request');
var bson = require('bson');
var IDeviceManager = require('../models/idevicemanager');
var BSON = bson.BSONPure.BSON
var db = require('../../common/mongoUtil.js').getDb()

var deviceManager = new IDeviceManager()

function updateJobStatus(session_id, status, cb) {
	db.collection('jobs').update({farm_id: my_id, session_id: new BSON.ObjectID(session_id)}, {$set: {status: status}}, function (err, result) {
		console.log('Updated status', err, session_id, status)
		if(cb)
			cb()
	})
}

function updateJob(session_id, params, cb) {
	db.collection('jobs').update({farm_id: my_id, session_id: new BSON.ObjectID(session_id)}, {$set: params}, function (err, result) {
		console.log('updateJob', err, session_id, params)
		if(cb)
			cb()
	})
}

function downloadApp(app_id, path, cb) {
	console.log('-> downloadApp', app_id, path)
	if (!fs.existsSync(path)){
		fs.mkdirSync(path);
	}
	request({uri: REMOTE_SERVER + '/geo/app/'+app_id+'/bundle'})
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
		console.log("downloadApp: " + err)
	})
}

function downloadScript(script_id, path, cb) {
	console.log('-> downloadScript', script_id, path)
	if (!fs.existsSync(path)){
		fs.mkdirSync(path);
	}
	request({uri: REMOTE_SERVER+'/geo/script/'+script_id+'/bundle'})
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
		console.log("downloadScript: " + err)
		//updateJob({message: "downloadScript Error: " + err})
	})
}

function runSesssion(session, udid) {
	var cmd = 'script="../'+session.script_path+'" SID='+session.session_id+' DEVICE_UDID='+udid+' APP_BUNDLE="'+session.app_path+'" ant -f AppiumTests/build.xml ios'
	console.log("Executing", cmd)
	updateJobStatus(session.session_id, 'RUNNING');
	var child = exec(cmd);
	var log = ''
	child.stdout.on('data', function(data) {
	    log+=data
	});
	child.stderr.on('data', function(data) {
	    log+=data
	});
	child.on('close', function(code) {
		var message = code == 0 ? "Test successful" : "Tests are failing. Check logs"
		updateJob(session.session_id, {log: log, message: message, status: 'FINISHED'});
	    console.log('closing code: ' + code);
	});

}

function performSession() {
	db.collection('jobs').findOne({farm_id:my_id, status:'READY'}, function(err, session) {
		console.log('performSession', err, session)
		if(session) {
			deviceManager.getMatchingDevice(function(udid) {
				if(udid)
					runSesssion(session, udid)
				else
					updateJob(session.session_id, {message: "No matching device found to run the script", status: 'FINISHED'});
			})
		}
	})
}

function processSessions() {
	db.collection('jobs').findOne({farm_id:my_id, status:'CREATED'}, function(err, session) {
		console.log('-> processSession', session)
		if(!session || !session.session_id) {
			performSession()
			return
		}
		//updateJobStatus(session.session_id, 'DOWNLOADING')
		var path = 'tmp/'+session.app_id+'/'
		downloadApp(session.app_id, path, function(app_path) {
			updateJob(session.session_id, {app_path: app_path})
			console.log('-> downloadApp', session.app_path)
			path += session.script_id + '/'
			downloadScript(session.script_id, path, function(script_path) {
				updateJob(session.session_id, {script_path: script_path})
				console.log('-> downloadScript', session.script_path)
				updateJobStatus(session.session_id, 'READY', function(){
					performSession()
				})
				
			})
		})
	})
}

exports.submitJob = function(sessions) {
	console.log("-> submitJob", sessions.length)
	for(var i = 0; i < sessions.length; ++i) {
		var _ses = {
			farm_id: my_id, 
			session_id: new BSON.ObjectID(sessions[i]._id), 
			app_id: new BSON.ObjectID(sessions[i].app_id), 
			script_id: new BSON.ObjectID(sessions[i].script_id), 
			status: 'CREATED', 
			createdAt: new Date()
		}
		db.collection('jobs').insert(_ses, function (err, result) {
			if (err) {
				console.log('An error has occurred', err.message);
			} else {
				console.log('Success: ', result);
			}
			processSessions()
		});
	}
}