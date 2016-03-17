var exports = module.exports;
exports.helpers = {}
exports.helpers['timeDiff'] = function(operand1, operand2) {
    return Math.round((operand1 - operand2)*10000)/10;
}

exports.helpers['formatTS'] = function(ts) {
    var format = new Date(ts*1000);
    return format.toISOString();
}

exports.helpers['trimString'] = function(passedString, startstring, endstring) {
   var theString = passedString.substring(0, 80);
   return theString
};

exports.helpers['formatBytes'] = function(bytes) {
   if(bytes == 0) return '0 bytes';
   var sizes = [' bytes', ' KB', ' MB', ' GB'];
   var i = Math.floor(Math.log(bytes) / Math.log(1024));
   return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + sizes[i];
}
