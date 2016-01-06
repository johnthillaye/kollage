var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlbumSchema = new Schema ({
	title: String,
	url: String,
	images: [
		{
			link: String,
			width: Number,
			height: Number,
			title: String,
			is_cover: Boolean
		}
	]
});

module.exports = AlbumSchema;