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

exports.helpers['compare'] = function (lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

}