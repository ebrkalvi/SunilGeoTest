var exports = module.exports;
exports.helpers = {}
exports.helpers['timeDiff'] = function(operand1, operand2) {
    return Math.round((operand1 - operand2)*10000)/10;
}

exports.helpers['formatTS'] = function(ts) {
    var format = new Date(ts*1000);
    return format;
}

exports.helpers['trimString'] = function(passedString, startstring, endstring) {
   var theString = passedString.substring(0, 80);
   return theString
};
