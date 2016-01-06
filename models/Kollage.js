var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var KollageSchema = new Schema ({
	_id: {
	    type: String,
	    unique: true,
	    default: shortid.generate
	},
	title: String,
	owner: String,
	albums: [{ type: Schema.Types.ObjectId, ref: 'Album'}]
});

module.exports = KollageSchema;