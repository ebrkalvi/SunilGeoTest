"use strict";

var exec = require('child_process').exec,
    plist = require('plist');

var IDevice = function (udid) {
    this.udid = udid || false;
};

IDevice.prototype.fetchInfo = function (cb) {
    exec("ideviceinfo -u " + this.udid + " -x", function (err, stdout, stderr) {
        if (err) {
            cb(err, stdout);
        } else {
            this.info = plist.parse(stdout)
            cb(null, info);
        }
    });
};

IDevice.prototype.getInfo = function (cb) {
    if (this.info)
        cb(null, this.info)
    else
        this.fetchInfo(cb);
};

module.exports = function (udid, opts) {
    return new IDevice(udid, opts);
};