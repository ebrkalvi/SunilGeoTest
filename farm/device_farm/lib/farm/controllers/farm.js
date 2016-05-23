var exports = module.exports;

var IDeviceManager  = require('../models/idevicemanager');

var deviceManager = new IDeviceManager()
exports.getDevices = function(req, res) {
    deviceManager.listAll(function(err, res) {
        console.log("-> getDevices", err, res)
    })
    res.status(200).send([{}]);
};