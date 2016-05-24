var exports = module.exports;

var IDeviceManager = require('../models/idevicemanager');

var deviceManager = new IDeviceManager()
exports.getDevices = function (req, res) {
    deviceManager.list(function (err, devices) {
        console.log("-> getDevices", err, devices)
        devices[0].getInfo(function (err, info) {
            console.log("-> info", err, info)
        })
        res.status(200).send(devices);
    })
};