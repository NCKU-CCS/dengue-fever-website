var express = require('express');
var File = express.Router();
var path = require('path');

File.get('/village_class', function (req, res, next) {
  var data = require('../data/village_class.json');
  res.header('Access-Control-Allow-Origin', '*');
  res.jsonp(data);
});

File.get('/:name', function (req, res, next) {
  var options = {
    root: path.resolve(process.cwd(), 'data'),
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
})

File.get('/:dir/:name', function (req, res, next) {
  var options = {
    root: path.resolve(process.cwd(), 'data/'+req.params.dir),
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
})


module.exports = File;
