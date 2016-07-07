var exports = module.exports;
var fs = require('fs');
var exec = require('child_process').exec;
var request = require('request');
var bson = require('bson');
var IDeviceManager = require('../models/idevicemanager');
var BSON = bson.BSONPure.BSON
var db = require('../../common/mongoUtil.js').getDb()

var deviceManager = new IDeviceManager()
var currentJob

function updateJobStatus(job_id, status, cb) {
	db.collection('jobs').update({_id: job_id}, {$set: {status: status}}, function (err, result) {
		console.log('Updated status', err, job_id, status)
		if(cb)
			cb()
	})
}

function updateJob(job_id, params, cb) {
	db.collection('jobs').update({_id: job_id}, {$set: params}, function (err, result) {
		console.log('updateJob', err, job_id, params)
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

function runSesssion(job, udid) {
	var cmd = 'script="../'+job.script_path+'" JID='+job._id+' DEVICE_UDID='+udid+' APP_BUNDLE="'+job.app_path+'" ant -f AppiumTests/build.xml ios'
	console.log("Executing", cmd)
	updateJobStatus(job._id, 'RUNNING');
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
		updateJob(job._id, {log: log, message: message, status: 'FINISHED'});
	    console.log('closing code: ' + code);
	    currentJob = undefined
	    processSessions()
	});

}

function performSession() {
	if(currentJob) {
		console.log('<- performSession', currentJob)
		return
	}
	db.collection('jobs').findOne({farm_id:my_id, status:'READY'}, {log: 0}, function(err, job) {
		console.log('performSession', err, job)
		if(job) {
			currentJob = job._id
			deviceManager.getMatchingDevice(function(udid) {
				if(udid)
					runSesssion(job, udid)
				else {
					updateJob(job._id, {message: "No matching device found to run the script", status: 'FINISHED'});
					currentJob = undefined
					processSessions()
				}
			})
		}
	})
}

function processSessions() {
	if(currentJob) {
		console.log('<- processSessions', currentJob)
		return
	}
	db.collection('jobs').findOne({farm_id:my_id, status:'CREATED'}, function(err, job) {
		console.log('-> processSession', job)
		if(!job || !job.session_id) {
			performSession()
			return
		}
		updateJob(job._id, {message: 'Downloading App...'})
		var path = 'tmp/'+job.app_id+'/'
		downloadApp(job.app_id, path, function(app_path) {
			updateJob(job._id, {app_path: app_path, message: 'Downloading Script...'})
			console.log('-> downloadApp', job.app_path)
			path += job.script_id + '/'
			downloadScript(job.script_id, path, function(script_path) {
				updateJob(job._id, {script_path: script_path, message: 'Ready to run'})
				console.log('-> downloadScript', job.script_path)
				updateJobStatus(job._id, 'READY', function(){
					performSession()
				})
				
			})
		})
	})
}

exports.submitJob = function(sessions) {
	console.log("-> submitJob", sessions.length)
	processSessions()
}