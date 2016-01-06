/**
 * Module dependencies
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    db = require('./db.js'),
    scanRoute = require('scan-route'),
    http = require('http'),
    path = require('path'),
    config = require('./config.js');

var app = module.exports = express();

// Configure all environments
app.set('port', process.env.PORT || config.port);

app.use(favicon(__dirname + '/src/favicon.png'));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({strict: false}));
app.set('view engine', 'ejs');

// development only
if (app.get('env') === 'development') {
  app.use(express.static(path.join(__dirname, 'src')));
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
  });
}

//Connect to db
var connection = db(app);

// Set up the routes.
scanRoute(app);

// Serve the index.html for root path.
app.get('/', function(req, res) {    
  res.sendFile(__dirname + '/src/index.html');
});

//Redirect lost user to homepage or 404
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/src/index.html');
});

//Start Server
var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
