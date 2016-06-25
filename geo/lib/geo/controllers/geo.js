var exports = module.exports;
var mongo = require('mongodb');
var bson = require("bson");
var ipaMetadata = require('ipa-metadata');
var parseApk = require('apk-parser');
var path = require('path')
var farmManager = require('../../farm/controllers/manager');
var BSON = bson.BSONPure.BSON
db = require('../../common/mongoUtil.js').getDb()

var activeSession
var currentAction

function insertEvent(geo, res) {
	geo.sid = new BSON.ObjectID(activeSession)
	geo.action = currentAction
	geo.type = geo.type ? geo.type : 'Network'
		console.log('Adding geo: ' + JSON.stringify(geo));
	db.collection('actions', function (err, collection) {
		collection.insert(geo, {
			safe: true
		}, function (err, result) {
			if (err) {
				res.send({err: 'An error has occurred'});
			} else {
				console.log('Success: ' + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
}

function parseIPA(path, app_id) {
	ipaMetadata(path, function (error, data) {
		var app_info = {
				status: 'PARSED',
				platform: 'iOS',
				name: data['metadata']['CFBundleName'],
				package: data['metadata']['CFBundleIdentifier']
		}
		console.log(app_info.name, app_info.package);
		db.collection('apps').update({'_id': new BSON.ObjectID(app_id)}, {$set: app_info}, function (err, result) {
			if (err) {
				console.log(err)
			} else {
				console.log('parseIPA Success: ' + JSON.stringify(result));
			}
		});
	});
}

function parseAPK(path, app_id) {
	parseApk(path, function (error, data) {
		console.log('parseAPK', data['manifest'][0]['application']);
		var app_info = {
				status: 'PARSED',
				platform: 'Android',
				name: data['manifest'][0]['application'][0]['@android:name'],
				package: data['manifest'][0]['@package']
		}
		console.log(app_info.name, app_info.package);
		db.collection('apps').update({
			'_id': new BSON.ObjectID(app_id)
		}, {
			$set: app_info
		}, function (err, result) {
			if (err) {
				console.log(err)
			} else {
				console.log('parseAPK Success: ' + JSON.stringify(result));
			}
		});
	});
}

exports.showJobs = function (req, res) {
	console.log("-> showJobs", req.params);
	db.collection('apps').findOne({_id: new BSON.ObjectID(req.params.id)}, {_id: 0, name: 1 }, function (err, app) {
		console.log("apps", err, app)
		if (err || !app) {
			res.status(404).send({err: err || "App not found"})
			return
		}
		db.collection('scripts').findOne({_id: new BSON.ObjectID(req.params.script)}, {_id: 0, name: 1 }, function (err, script) {
			console.log("scripts", err, script)
			if (err || !script) {
				res.status(404).send({err: err || "Script not found"})
				return
			}
			db.collection('sessions').findOne({_id: new BSON.ObjectID(req.params.session)}, function (err, session) {
				if (err || !session) {
					res.send({err: err || "Session not Found"})
					return
				}
				db.collection('jobs').find({session_id: new BSON.ObjectID(req.params.session), app_id: new BSON.ObjectID(req.params.id)})
					.limit(50).sort({'createdAt': -1}).toArray(function (err, jobs) {
						console.log("Jobs", jobs.length)
						var template = __dirname + '/../views/jobs';
						res.render(template, {
							siteTitle: "Geo Testing",
							app: app,
							script: script,
							session: session,
							jobs: jobs
						})
					});
			});
		});
	});

	farmManager.processPendingSessions()
};

exports.addJob = function(req, res) {
	console.log("-> addJob", req.params);
	db.collection('apps').findOne({_id: new BSON.ObjectID(req.params.id)}, {_id: 0, name: 1 }, function (err, app) {
		console.log("apps", err, app)
		if (err || !app) {
			res.status(404).send({err: err || "App not found"})
			return
		}
		db.collection('scripts').findOne({_id: new BSON.ObjectID(req.params.script)}, {_id: 0, name: 1 }, function (err, script) {
			console.log("scripts", err, script)
			if (err || !script) {
				res.status(404).send({err: err || "Script not found"})
				return
			}
			db.collection('sessions').findOne({_id: new BSON.ObjectID(req.params.session)}, function (err, session) {
				if (err || !session) {
					res.status(404).send({err: err || "Session not Found"})
					return
				}
				var _job = {
					//farm_id: my_id, 
					session_id: new BSON.ObjectID(session._id), 
					app_id: new BSON.ObjectID(session.app_id), 
					script_id: new BSON.ObjectID(session.script_id), 
					status: 'CREATED', 
					createdAt: new Date()
				}
				db.collection('farms').find({status: 'APPROVED'}, {uid: 1}).toArray(function (err, farms) {
			        console.log("Farms count", farms.length)
			        for (var i = 0; i < farms.length; ++i) {
			        	delete _job._id
			            _job.farm_id = farms[i].uid
			            db.collection('jobs').insert(_job, function (err, result) {
							if (err) {
								console.log('An error has occurred while adding job', err.message);
							} else {
								console.log('Success adding job: ', _job);
							}
						});
			        }
			        res.json({status: 0})
					farmManager.processPendingSessions()
			    })
				
			});
		});
	});
}

exports.redoJob = function(req, res) {
	console.log("-> redoJob", req.params);
	db.collection('jobs').update({_id: new BSON.ObjectID(req.params.job)}, {$set: {status: 'CREATED', createdAt: new Date()}}, function (err, result) {
		if (err) {
			console.log('An error has occurred while updating job', err.message);
			res.json({status: -1})
		} else {
			console.log('Success updating job: ', result);
			res.json({status: 0})
		}
		farmManager.processPendingSessions()
	});
}

exports.getJobLog = function(req, res) {
	db.collection('jobs').findOne({_id: new BSON.ObjectID(req.params.job)}, {log: 1, _id: 0}, function (err, job) {
		if(err)
			res.json({err: err})
		else
			res.send(job.log)
	});
}

exports.showSessions = function (req, res) {
	console.log("-> Sessions", req.params);
	db.collection('apps').findOne({ _id: new BSON.ObjectID(req.params.id) }, { name: 1, platform: 1 }, function (err, app) {
		console.log("app", err, app)
		if (err || !app) {
			res.status(404).send({err: err || "No such app found"})
			return
		}
		db.collection('scripts').findOne({ _id: new BSON.ObjectID(req.params.script) }, { _id: 0, name: 1 }, function (err, script) {
			console.log("script", err)
			if (err || !script) {
				res.status(404).send({err: err || "No such script found"})
				return
			}
			db.collection('sessions').find({script_id: new BSON.ObjectID(req.params.script)}, {script_id: 0})
			.limit(50).sort({'createdAt': -1}).toArray(function (err, items) {
				console.log("Sessions", items.length)
				var template = __dirname + '/../views/sessions';
				res.render(template, {
					siteTitle: "Geo Testing",
					app: app,
					script_name: script.name,
					script_id: req.params.script,
					sessions: items
				})
			})
		})
	})

	farmManager.processPendingSessions()
}

exports.getSessions = function (req, res) {
	res.status(501).json({err: "Not yet implemented!"})
}

exports.addSession = function (req, res) {
	console.log('Adding Session: ', req.params);
	var script_id = new BSON.ObjectID(req.params.script)
	var app_id = new BSON.ObjectID(req.params.id)
	db.collection('apps').findOne({_id: app_id}, {_id: 0, name: 1 }, function (err, app) {
		console.log("apps", err, app)
		if (err || !app) {
			res.status(404).send({err: err || "No such app found"})
			return
		}
		var doc = {
				createdAt: new Date(),
				script_id: script_id,
				app_id: app_id,
				status: 'CREATED'
		}
		db.collection('sessions').insert(doc, function (err, result) {
			if (err) {
				res.send({err: err});
			} else {
				console.log('Success: ' + JSON.stringify(result));
				activeSession = result.ops[0]._id + ""
				res.send(activeSession);

				farmManager.notifyNewSession(activeSession)
			}
		});
	})
}

exports.deleteSession = function (req, res) {
	res.status(501).json({err: "Not yet implemented!"})
}

exports.showScripts = function (req, res) {
	console.log("-> showScripts", req.params);
	db.collection('apps').findOne({_id: new BSON.ObjectID(req.params.id)}, {_id: 0, name: 1 }, function (err, app) {
		console.log("apps", err, app)
		if (err || !app) {
			res.status(404).send({err: err || "No such app found"})
			return
		}
		db.collection('scripts').find({app_id: new BSON.ObjectID(req.params.id)}, {app_id: 0})
		.limit(50)
		.sort({'createdAt': -1}).toArray(function (err, items) {
			console.log("Scripts count=", items.length)
			var template = __dirname + '/../views/scripts';
			res.render(template, {
				siteTitle: "Geo Testing",
				app_name: app.name,
				app_id: req.params.id,
				scripts: items
			})
		})
	})
}

exports.getScripts = function (req, res) {
	res.status(501).json({err: "Not yet implemented!"})
}

exports.addScript = function (req, res) {
	var script = req.body;
	console.log('Adding Script: ', script, req.files);
	var date_now = new Date()
	var serverPath = 'uploads/scripts/' + date_now.getTime() + req.files.file.name;

	require('fs').rename(
			req.files.file.path,
			serverPath,
			function (err) {
				if (err) {
					console.log(err)
					res.send({error: 'Error uploading script'});
					return;
				}
				console.log('Upload Success: ' + serverPath);
				var doc = {
						name: script.name,
						app_id: new BSON.ObjectID(req.params.id),
						createdAt: date_now,
						path: serverPath,
						status: 'CREATED'
				}
				db.collection('scripts').insert(doc, {}, function (err, result) {
					if (err) {
						console.log(err)
						res.send({error: 'An error has occurred'});
					} else {
						console.log('Success: ' + JSON.stringify(result));
						var r = result.ops[0]._id + ""
						res.send(r);
					}
				});
			}
	);

}

exports.updateScript = function (req, res) {
	/*{scripts: {
            $elemMatch: {
                {$eq: number}
            }
        }*/
	res.status(501).json({err: "Not yet implemented!"})
}

exports.getScriptBundle = function (req, res) {
	db.collection('scripts').findOne({_id: new BSON.ObjectID(req.params.script)}, {path: 1, _id:0}, function (err, script) {
		console.log("getScriptBundle", script)
		if (err)
			res.send({error: 'An error has occurred'});
		else {
			res.set({
			    "Content-Disposition": 'attachment; filename="'+path.basename(script.path)+'"'
			});
			res.sendFile(script.path, { root : __dirname + '/../../..'});
		}
	});
};

exports.deleteScript = function (req, res) {
	res.status(501).json({err: "Not yet implemented!"})
}

exports.addApp = function (req, res) {
	var app = req.body;
	console.log('Adding App: ', req.files);
	var date_now = new Date()
	var serverPath = 'uploads/apps/' + date_now.getTime() + req.files.file.name;

	require('fs').rename(
			req.files.file.path,
			serverPath,
			function (err) {
				if (err) {
					console.log(err)
					res.send({error: 'Error uploading app'});
					return;
				}
				console.log('Upload Success: ' + serverPath);
				var doc = {
						createdAt: date_now,
						path: serverPath,
						status: 'CREATED'
				}
				db.collection('apps').insert(doc, {}, function (err, result) {
					if (err) {
						console.log(err)
						res.send({
							error: 'An error has occurred',
						});
					} else {
						console.log('Success: ' + JSON.stringify(result));
						var r = result.ops[0]._id + ""
						res.send(r);
						var ext = serverPath.slice(-4)
						if (ext == '.ipa')
							parseIPA(serverPath, r)
							else if (ext == '.apk')
								parseAPK(serverPath, r)
					}
				});
			}
	);

};

exports.getApps = function (req, res) {
	var sel = {path: 0, createdAt: 0, status: 0}
	db.collection('apps', function (err, collection) {
		collection.find({}, sel).limit(50).sort({
			'createdAt': -1
		}).toArray(function (err, items) {
			console.log("count=", items.length, activeSession)
			if (err)
				res.send({error: 'An error has occurred'});
			else
				res.send(items)
		});
	});
};

exports.getApp = function (req, res) {
	db.collection('apps').findOne({_id: new BSON.ObjectID(req.params.id)}, function (err, app) {
		console.log("app", app)
		if (err)
			res.send({error: 'An error has occurred'});
		else
			res.send(app)
	});
};

exports.getAppBundle = function (req, res) {
	db.collection('apps').findOne({_id: new BSON.ObjectID(req.params.id)}, {path: 1, _id:0}, function (err, app) {
		console.log("getAppBundle", app)
		if (err)
			res.send({error: 'An error has occurred'});
		else {
			res.set({
			    "Content-Disposition": 'attachment; filename="'+path.basename(app.path)+'"'
			});
			res.sendFile(app.path, { root : __dirname + '/../../..'});
		}
	});
};

exports.showApps = function (req, res) {
	console.log("-> apps");
	db.collection('apps').find().limit(50).sort({
		'createdAt': -1
	}).toArray(function (err, items) {
		console.log("Apps count=", items.length)
		var template = __dirname + '/../views/apps';
		res.render(template, {
			siteTitle: "Geo Testing",
			apps: items
		})
	});
};

exports.findById = function (req, res) {
	var id = req.params.id;
	console.log('Retrieving geo: ' + id);
	db.collection('actions').findOne({
		'_id': new BSON.ObjectID(id)
	}, function (err, item) {
		res.send(item);
	});
};

exports.setCurrentAction = function (req, res) {
	currentAction = req.body.action
	console.log('setCurrentAction: ' + currentAction);
	insertEvent({
		type: 'User'
	}, res)
	//res.send(currentAction);
};

exports.activateSession = function (req, res) {
	activeSession = req.body.sid
	console.log('Activated Session: ' + activeSession);
	res.send(activeSession);
};

exports.deactivateSession = function (req, res) {
	if (req.body.sid == activeSession) {
		activeSession = undefined
		currentAction = undefined
		console.log('De-Activated Session: ' + req.body.sid);
		res.send(req.body.sid);
	} else
		res.send({
			error: 'An error has occurred'
		});
};

exports.getSessions = function (req, res) {
	db.collection('sessions', function (err, collection) {
		collection.find().limit(50).sort({
			'createdAt': -1
		}).toArray(function (err, items) {
			console.log("count=", items.length, activeSession)
			if (err)
				res.send({
					error: 'An error has occurred'
				});
			else
				res.send(items)
		});
	});
};

exports.getSession = function (req, res) {
	db.collection('sessions', function (err, collection) {
		collection.find({
			_id: new BSON.ObjectID(req.params.id)
		}).toArray(function (err, items) {
			console.log("count=", items.length, activeSession)
			if (err)
				res.send({
					error: 'An error has occurred'
				});
			else
				res.send(items)
		});
	});
};

exports.sessions = function (req, res) {
	console.log("-> sessions");
	db.collection('sessions').find().limit(50).sort({
		'createdAt': -1
	}).toArray(function (err, items) {
		console.log("count=", items.length, activeSession)
		for (var i = 0; i < items.length; ++i)
			if (items[i]._id == activeSession)
				items[i].active = true
				var template = __dirname + '/../views/sessions';
		res.render(template, {
			siteTitle: "Geo Testing",
			sessions: items,
			activeSession: activeSession
		})
	});
};

exports.deleteSession = function (req, res) {
	var id = req.body.sid;
	console.log('Deleting session: ' + id);
	db.collection('sessions', function (err, collection) {
		collection.remove({
			'_id': new BSON.ObjectID(id)
		}, {
			safe: true
		}, function (err, result) {
			if (err) {
				res.send({
					'error': 'An error has occurred - ' + err
				});
			} else {
				console.log('Sessions ' + result + ' document(s) deleted');
				db.collection('actions', function (err, collection) {
					collection.remove({
						'sid': new BSON.ObjectID(id)
					}, {
						safe: true
					}, function (err, result) {
						if (err) {
							res.send({
								'error': 'An error has occurred - ' + err
							});
						} else {
							console.log('Actions' + result + ' document(s) deleted');
							res.send(req.body);
						}
					});
				});
			}
		});
	});
};
var timeDiff = function (operand1, operand2) {
	return Math.round((operand1 - operand2) * 10000) / 10;
}
var formatBytes = function (bytes) {
	if (bytes == 0) return '0 bytes';
	var sizes = [' bytes', ' KB', ' MB', ' GB'];
	var i = Math.floor(Math.log(bytes) / Math.log(1024));
	return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + sizes[i];
}

function getActions(job_id, excludes, cb) {
	console.log("getActions", job_id);
	db.collection('actions').find({jid: new BSON.ObjectID(job_id), 'request.host': {$nin: excludes}})
		.limit(50).sort({'createdAt': -1})
		.toArray(function (err, items) {
			if (err)
				cb(err, items)
			else {
				var _it = []
				for (var i = 0; i < items.length; ++i) {
					if (items[i].type != 'User')
						_it.push({
							type: items[i].type,
							requested_at: items[i].request.timestamp_start,
							action: items[i].action,
							url: items[i].request.host + items[i].request.path,
							request_time: timeDiff(items[i].request.timestamp_end, items[i].request.timestamp_start),
							execution_time: timeDiff(items[i].response.timestamp_start, items[i].request.timestamp_end),
							response_time: timeDiff(items[i].response.timestamp_end, items[i].response.timestamp_start),
							total_time: timeDiff(items[i].response.timestamp_end, items[i].request.timestamp_start),
							response_size: formatBytes(items[i].response.contentLength)
						})
					else
						_it.push(items[i])
				}
				cb(err, _it)
			}
		});
}

exports.showActions = function (req, res) {
	console.log("-> showActions", req.params);
	db.collection('apps').findOne({_id: new BSON.ObjectID(req.params.id)}, {_id: 0, name: 1 }, function (err, app) {
		console.log("apps", err, app)
		if (err || !app) {
			res.status(404).send({err: err || "App not found"})
			return
		}
		db.collection('scripts').findOne({_id: new BSON.ObjectID(req.params.script)}, {_id: 0, name: 1 }, function (err, script) {
			console.log("scripts", err, script)
			if (err || !script) {
				res.status(404).send({err: err || "Script not found"})
				return
			}
			db.collection('sessions').findOne({_id: new BSON.ObjectID(req.params.session)}, function (err, session) {
				if (err || !session) {
					res.send({err: err || "Session not Found"})
					return
				}
				var excludes = ['metxms.citrix.com', /[^.\s]+\.apple\.com/g]
				getActions(req.params.job, excludes, function (err, items) {
					console.log("actions count", items.length, session);
					var template = __dirname + '/../views/actions';
					res.render(template, {
						siteTitle: "Geo Testing - " + script.name,
						app: app,
						script: script,
						session: session,
						excludes: excludes,
						actions: items
					})
				})
			});
		});
	});


};

exports.addGeo = function (req, res) {
	if (!activeSession)
		res.send({
			'error': 'No active session!'
		});
	insertEvent(req.body, res);
}

exports.updateGeo = function (req, res) {
	var id = req.params.id;
	var geo = req.body;
	console.log('Updating geo: ' + id);
	console.log(JSON.stringify(geo));
	db.collection('actions', function (err, collection) {
		collection.update({
			'_id': new BSON.ObjectID(id)
		}, geo, {
			safe: true
		}, function (err, result) {
			if (err) {
				console.log('Error updating geo: ' + err);
				res.send({
					'error': 'An error has occurred'
				});
			} else {
				console.log('' + result + ' document(s) updated');
				res.send(geo);
			}
		});
	});
}

exports.deleteGeo = function (req, res) {
	var id = req.params.id;
	console.log('Deleting geo: ' + id);
	db.collection('actions', function (err, collection) {
		collection.remove({
			'_id': new BSON.ObjectID(id)
		}, {
			safe: true
		}, function (err, result) {
			if (err) {
				res.send({
					'error': 'An error has occurred - ' + err
				});
			} else {
				console.log('' + result + ' document(s) deleted');
				res.send(req.body);
			}
		});
	});
}