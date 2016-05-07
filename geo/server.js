// @see: https://gist.github.com/branneman/8048520
require('app-module-path').addPath(__dirname + '/lib');

var server = require('nodebootstrap-server')
  , appConfig = require('./appConfig')
  , express = require('express')
  , app    = express();


app = require('nodebootstrap-htmlapp').setup(app);

app.use(express.static(__dirname + '/public'));
server.setup(app, appConfig.setup);
