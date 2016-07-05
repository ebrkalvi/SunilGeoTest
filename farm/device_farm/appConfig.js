require('app-module-path').addPath(__dirname + '/lib');
var nconf = require('nconf');
var uuid = require('node-uuid');
var request = require('request');
var bodyParser = require('body-parser');
var mongoUtil = require('./lib/common/mongoUtil');

exports.setup = function (runningApp, callback) {
    // Nothing ever comes from "x-powered-by", but a security hole
    runningApp.disable("x-powered-by");
    
    runningApp.use(bodyParser.urlencoded({extended: true}));
    runningApp.use(bodyParser.json());

    nconf.use('file', {file: './.config.json'});
    nconf.load();

    var HOST = 'localhost'
    //var HOST = "52.9.101.199"
    global.WS_SERVER = 'ws://' + HOST + ':8080'
    global.REMOTE_SERVER = 'http://' + HOST + ':3000'
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

    global.my_pwd = nconf.get('pwd')
    if (!global.my_pwd) {
        request.post(
            REMOTE_SERVER + '/farms/register', {
                form: {
                    my_id: global.my_id
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                    nconf.set('pwd', JSON.parse(body).pwd)
                    nconf.save(function (err) {
                        if (err) {
                            console.error(err.message);
                            return;
                        }
                        console.log('Password saved successfully.', nconf.get('pwd'));
                        global.my_pwd = nconf.get('pwd')
                        mongoUtil.connectToServer(function (err, _db) {
                            console.log("-> connectToServer mongodb")
                            runningApp.use('/farm', require('farm'));
                        });
                    });
                } else {
                    console.error("Failed registering", error, response.statusCode)
                }
            }
        );
    } else {
        mongoUtil.connectToServer(function (err, _db) {
            console.log("-> connectToServer mongodb")
            runningApp.use('/farm', require('farm'));
        });
    }


    // API endpoint attached to root route:
    runningApp.use('/', require('homedoc')); // attach to root route

    if (typeof callback === 'function') {
        callback(runningApp);
    }
};