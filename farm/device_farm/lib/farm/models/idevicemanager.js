"use strict";

var exec = require('child_process').exec;
var IDevice = require('../models/idevice')
var IDeviceManager = function () {};

IDeviceManager.prototype.list = function (cb) {
    exec("idevice_id -l", function (err, stdout, stderr) {
        if (err) {
            cb(err, stdout);
        } else {
            var devices = stdout.match(/.+/g) || []
            if (devices)
                devices = devices.map(function (udid) {
                    return {
                        udid: udid,
                        platform: 'iOS'
                    }
                })
            cb(null, devices);
        }
    });
};

IDeviceManager.prototype.getDevice = function (udid) {
    return new IDevice(udid)
};

module.exports = function (udid, opts) {
    return new IDeviceManager(udid, opts);
};