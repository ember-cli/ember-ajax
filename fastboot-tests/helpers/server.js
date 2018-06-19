var express = require('express');
var posts = require('./fixtures').POSTS;
var log = require('debug')('fastboot-tests:express-server');

var app = express();

app.use((req, res, next) => {
  log(`${req.method}: ${req.originalUrl}`);

  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  );

  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/posts', (req, res) => {
  res.json(posts);
});

module.exports = app;
