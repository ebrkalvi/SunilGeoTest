"use strict";

var exec = require('child_process').exec

var IDevice = function (udid) {
    this.udid = udid || false;
};

function parseInfo(info) {
    var lines = info.split('\n');
    var parsed = []
    var val, key
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(' ')) {
            console.log('val[line[0]]', key, val[key])
            if(key)
                val[key].push(lines[i])
            continue;
        }
        key = lines[i].substr(0, lines[i].indexOf(':'))
        if (key) {
            val = {}
            val[key] = lines[i].substr(lines[i].indexOf(':')+1).trim() || []
            parsed.push(val)
        }
    }
    return parsed
}

IDevice.prototype.fetchInfo = function (cb) {
    var self = this
    console.log("ideviceinfo -u " + this.udid + " -s")
    exec("ideviceinfo -u " + this.udid + " -s", function (err, stdout, stderr) {
        if (err) {
            cb(err, stdout);
        } else {
            if (!stdout.startsWith('Usage'))
                self.info = parseInfo(stdout)
            cb(null, self.info);
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