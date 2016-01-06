'use strict';

var request = require('request');
var cheerio = require('cheerio');
var nodeurl = require('url');
var imagesize = require('imagesize');
var async = require('async');
var _ = require('underscore');
var shortid = require('shortid');

var LIMIT = 50;
var PAGE = 0;
    
module.exports = {
  'findAll': {
    method: 'get',
    path: '/api/albums',
    callback: function (req, res) {
      var limit = req.query.limit || LIMIT;
      var page = req.query.page || PAGE;
      var skip = limit * page;

      req.db.Album.find({}).skip(skip).limit(limit).exec(function (err, docs) {
        if (err) throw err;
        
        var obj = {page: page, count: docs.length, results: docs}
        res.json(obj);
      })
    }
  },
  'findById': {
    method: 'get',
    path: '/api/albums/:id',
    callback: function (req, res) {
      req.db.Album.findOne({_id: req.params.id}).exec(function (err, doc) {
        if (err) throw err;
        
        res.json(doc);
      })
    }
  },
  'removeImageFromAlbum': {
    method: 'delete',
    path: '/api/albums/:id/images/:imageId',
    callback: function (req, res) {
      req.db.Album.findOneAndUpdate({_id: req.params.id}, {$pull: {images: {_id: req.params.imageId}}}).exec(function (err, doc) {
        if (err) console.log(err);
        if (!doc) res.status(404).send();

        console.log(doc);

        res.status(200).send();
      })
    }
  },
  'add': {
    method: 'post',
    path: '/api/albums',
    callback: addAlbum
  },
  'addToKollage': {
    method: 'post',
    path: '/api/kollages/:kollageId/albums',
    callback: addAlbum
  } 
}

function addAlbum (req, res) {

  function callback (err) {
    if (err) res.status(400).send();

    var album = new req.db.Album({title: title, url: req.body.url, images: images});
    var kollageId = req.body.kollageId || req.params.kollageId || shortid.generate();

    album.save(function (err) {
      if (err) console.log(err);

      req.db.Kollage.findOneAndUpdate({_id: kollageId}, {$push: {'albums': album._id}}, {upsert: true}, function (err, kollage) {
        if (err) console.log(err);

        res.json(album);
      })
    })
  }

  var images = [];
  var title = "";

  if (req.body.url) {
    request
      .get(req.body.url)
      .on('error', function (err){
        callback(err);
      })
      .on('response', function (response) {
        console.log(response.headers);

        //check if direct image
        if (response.headers['content-type'].slice(0,5) === 'image') {
          imagesize(response, function (err, result) {
            console.log(result);
            if (result.width > 300 || result.height > 300) images.push({link: req.body.url, width: result.width, height: result.height});
            return callback();
          })
        }
        else {

          var body = '';
          response.on('data', function (chunk) {
            body += chunk;
          });

          response.on('end', function () {
            var $ = cheerio.load(body);
            var title = $("title").text() || "";

            var imagesLinks = $("img").map(function (i, elem) { return $(elem).attr('src')}).toArray();
            $("a[href$='jpg']").each(function (i, elem) { imagesLinks.push($(elem).attr('href'))});
            imagesLinks = _.uniq(imagesLinks);
            
            async.each(imagesLinks, function (imageLink, callback) {
              var url = nodeurl.resolve(req.body.url, imageLink);
              if (url.slice(0,4) !== 'http') return callback();
              console.log(url);

              request
                .get(url)
                .on('error', function (err) {
                  console.log(err);
                  callback();
                })
                .on('response', function(response) {
                  console.log(response.headers['content-type'], response.headers['content-length']) // 'image/png'
                  
                  if (response.headers['content-type'].slice(0,5) === 'image') {
                    imagesize(response, function (err, result) {
                      console.log(result);
                      if (result.width > 300 || result.height > 300) images.push({link: url, width: result.width, height: result.height});
                      callback();
                    })
                  }
                  else return callback();
                })
            }, callback);
          });
        }
      })

  }
}