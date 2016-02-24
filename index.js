'use strict';

let loadRoutes = require('./lib/load_modules'),
    _ = require('highland'),
    jsr = require('json-stream-response');

module.exports = {
  'configureServer': (restifyServer, conf, params, cb) => {

    // throw descriptive error when config not provided
    // TODO: maybe replace this with config defaults
    if (typeof conf === 'undefined') {
      throw new Error('Config not provided.');
    }

    conf.handlersDir = conf.handlersDir || './endpoints';
    loadRoutes(conf.handlersDir, restifyServer, params, cb);
  },
  'streamResponse': (res) => {
    return jsr(res);
  },
  'jsonResponder': (res, next) => {
    return (err, result) => {
      if (err) {
        next(err);
      }
      else {
        res.send(200, result);
      }
    }
  }
};
