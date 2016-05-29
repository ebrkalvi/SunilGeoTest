var exports = module.exports;

var IDeviceManager = require('../models/idevicemanager');

var deviceManager = new IDeviceManager()
exports.getDevices = function (cb) {
    deviceManager.list(function (err, devices) {
        console.log("-> getDevices", err, devices)
        cb(err, devices);
    })
};

exports.getDeviceInfo = function (req, res) {
    console.log("-> getDeviceInfo", req.params)
    var udid = req.params.id
    deviceManager.getDevice(udid).getInfo(function(err, info) {
        console.log("-> getDeviceInfo", err, info)
        res.status(200).send(info);
    })
};