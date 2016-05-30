var exports = module.exports;

var IDeviceManager = require('../models/idevicemanager');

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