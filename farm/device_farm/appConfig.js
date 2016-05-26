require('app-module-path').addPath(__dirname + '/lib');
var nconf = require('nconf');
var uuid = require('node-uuid');

exports.setup = function (runningApp, callback) {
    // Nothing ever comes from "x-powered-by", but a security hole
    runningApp.disable("x-powered-by");

    nconf.use('file', {
        file: './config.json'
    });
    nconf.load();

    global.my_id = nconf.get('my_id')
    console.log('my_id', global.my_id)
    if (!global.my_id) {
        global.my_id = uuid.v4()
        nconf.set('my_id', global.my_id)
        nconf.save(function (err) {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log('Configuration saved successfully.', global.my_id, nconf.get('my_id'));
        });
    }

    // Choose your favorite view engine(s)
    runningApp.set('view engine', 'handlebars');
    runningApp.engine('handlebars', require('hbs').__express);

    runningApp.use('/farm', require('farm')); // attach to sub-route

    // API endpoint attached to root route:
    runningApp.use('/', require('homedoc')); // attach to root route

    if (typeof callback === 'function') {
        callback(runningApp);
    }
};