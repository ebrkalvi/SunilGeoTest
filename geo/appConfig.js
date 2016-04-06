require('app-module-path').addPath(__dirname + '/lib');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');

exports.setup = function(runningApp, callback) {
    // Nothing ever comes from "x-powered-by", but a security hole
    runningApp.disable("x-powered-by");

    // configure the app to use bodyParser()
    runningApp.use(bodyParser.urlencoded({
                                             extended: true
                                         }));
    runningApp.use(bodyParser.json());

    //
    var hbs = exphbs.create({
        defaultLayout: __dirname + '/views/layouts/main.handlebars',
	layoutsDir: __dirname + '/views/layouts',
        helpers: require("./public/js/helpers.js").helpers
    });

    runningApp.engine('handlebars', hbs.engine);
    runningApp.set('view engine', 'handlebars');

    runningApp.use('/geo', require('geo')); // attach to sub-route

    // API endpoint attached to root route:
    runningApp.use('/', require('hello')); // attach to root route

    // If you need websockets:
    // var socketio = require('socket.io')(runningApp.http);
    // require('fauxchatapp')(socketio);

    if(typeof callback === 'function') {
        callback(runningApp);
    }
};
