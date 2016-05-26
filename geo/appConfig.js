require('app-module-path').addPath(__dirname + '/lib');
var bodyParser = require('body-parser');
//var exphbs  = require('express-handlebars');
expejs = require("express-ejs-layouts")
var mongoUtil = require('./lib/common/mongoUtil')

exports.setup = function (runningApp, callback) {
    // Nothing ever comes from "x-powered-by", but a security hole
    runningApp.disable("x-powered-by");

    // configure the app to use bodyParser()
    runningApp.use(bodyParser.urlencoded({
        extended: true
    }));
    runningApp.use(bodyParser.json());

    runningApp.use(expejs)
    runningApp.set('view engine', 'ejs');
    runningApp.set('layout', __dirname + '/views/layouts/main.ejs');

    mongoUtil.connectToServer(function (err, _db) {
        console.log("connectToMongoServer", err)
        _db.collection('farms', {
            strict: true
        }, function (err, collection) {
            if (err) {
                console.log("The 'farms' collection doesn't exist.");
            } else {
                collection.createIndex({
                    "uid": 1
                }, {
                    unique: true
                })
                collection.count(function (err, count) {
                    console.log("The 'users' collection...", count);
                })
            }
        });

        runningApp.use('/geo', require('geo'));
        runningApp.use('/farm', require('farm'));
    });

    if (typeof callback === 'function') {
        callback(runningApp);
    }
};