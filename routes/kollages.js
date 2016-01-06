'use strict';

var async = require('async');
var _ = require('underscore');

var LIMIT = 50;
var PAGE = 0;
    
module.exports = {
  'findAll': {
    method: 'get',
    path: '/api/kollages',
    callback: function (req, res) {
      var limit = req.query.limit || LIMIT;
      var page = req.query.page || PAGE;
      var skip = limit * page;

      req.db.Kollage.find({}).skip(skip).limit(limit).exec(function (err, docs) {
        if (err) throw err;
        
        var obj = {page: page, count: docs.length, results: docs}
        res.json(obj);
      })
    }
  },
  'random': {
    method: 'get',
    path: '/api/kollages/random',
    callback: function (req, res) {
      req.db.Kollage.count().exec(function(err, count){

        var random = Math.floor(Math.random() * count);

        req.db.Kollage.findOne().skip(random).populate('albums').exec(function (err, doc) {
          if (err) throw err;
          
          res.json(doc);
        });
      });
    }
  },
  'findById': {
    method: 'get',
    path: '/api/kollages/:id',
    callback: function (req, res) {
      req.db.Kollage.findOne({_id: req.params.id}).populate('albums').exec(function (err, doc) {
        if (err) throw err;
        
        res.json(doc);
      })
    }
  },
  'add': {
    method: 'post',
    path: '/api/kollages',
    callback: function (req, res) {

      var kollage = new req.db.Kollage({title: req.body.title || ''});
      kollage.save(function (err) {
        if (err) console.log(err);

        res.json(kollage);
      })
    }
  }
  // },
  // 'update': {
  //   method: 'put',
  //   path: '/api/kollages/:id',
  //   callback: function (req, res) {
  //     req.db.Kollage.findOne({_id: req.params.id}).exec(function (err, doc) {
  //       if (err) throw err;
  //       if (!doc) res.status(404).json({});
        
  //       if (req.body.tit)
  //       res.json(doc);
  //     })
  //   }
  // }
  
}