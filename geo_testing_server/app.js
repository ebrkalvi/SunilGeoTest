var express = require('express'),
        geo = require('./routes/geo');
var morgan = require('morgan')
var bodyParser = require('body-parser')

var app = express();

app.use(morgan('dev'));     /* 'default', 'short', 'tiny', 'dev' */
//app.use(bodyParser());
app.set('view engine', 'handlebars');
app.engine('handlebars', require('hbs').__express);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
                                  extended: true
                              }));

//app.use('/trader', require('trader')); // attach to sub-route

// API endpoint attached to root route:
app.use('/', require('homedoc')); // attach to root route

app.get('/geo', geo.findAll);
app.get('/geo/:id', geo.findById);
app.post('/geo', geo.addGeo);
app.put('/geo/:id', geo.updateGeo);
app.delete('/geo/:id', geo.deleteGeo);

app.listen(3000);
console.log('Listening on port 3000...');

