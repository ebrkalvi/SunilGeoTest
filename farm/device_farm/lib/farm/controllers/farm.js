var exports = module.exports;
var bson = require('bson');
var BSON = bson.BSONPure.BSON
var jobs = require('./jobs.js')
var db = require('../../common/mongoUtil.js').getDb()

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

exports.performSession = function (session, cb) {
	jobs.submitJob(session)
    cb(null, {res: 'Submitted'})
};

var activeSession

function insertEvent(geo, res) {
	geo.sid = new BSON.ObjectID(activeSession)
	geo.action = currentAction
	geo.createdAt = new Date()
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

