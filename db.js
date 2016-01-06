var mongoose = require('mongoose'),
    models = require('./models'),
    config = require('./config.js');

module.exports = function (app) {
	//Connect to db
	var connection = mongoose.createConnection(config.dbUrl);
	connection.on('error', console.error.bind(console, 'connection error:'));
	connection.once('open', function () {
	  console.info('connected to database')
	});

	// Middleware: Pipes Models in req.db object
	app.use(function( req, res, next ){
	  req.db = {};
	  for (var modelName in models) {
	    req.db[modelName] = connection.model(modelName, models[modelName]);
	  }
	  next();
	})

	return connection;
}