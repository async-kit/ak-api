'use strict';

let loadRoutes = require('./lib/load_modules'),
    _ = require('highland');

module.exports = function(restifyServer, conf, params, cb) {
  conf.handlersDir = conf.handlersDir || './endpoints';
  loadRoutes(conf.handlersDir, restifyServer, params, cb);
};
