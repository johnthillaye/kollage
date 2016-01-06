var fs = require("fs");
var path = require("path");
var mongoose = require("mongoose");

var schemaFiles = fs.readdirSync(__dirname);

schemaFiles.forEach(function (filename) {

	//match .js files in directory exclunding index.js
	if (filename.match(/^((?!(index|_)).)*\.js$/)) {		//get readable name
		var schemaName = filename.substring(0, filename.length - 3);
		var schema = require(path.join(__dirname, filename));

		schema.set('toJSON', {virtuals: true});

		var model = mongoose.model(schemaName, schema);
		exports[schemaName] = model;
	}	
})
