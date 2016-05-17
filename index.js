const loadRoutes = require('./lib/load_modules');
const jsr = require('json-stream-response');

const httpSuccess = 200;

module.exports = {
  // eslint-disable-next-line max-params
  'configureServer': (restifyServer, conf, params, cb) => {

    // throw descriptive error when config not provided
    // TODO: maybe replace this with config defaults
    if (typeof conf === 'undefined') {
      throw new Error('Config not provided.');
    }

    conf.handlersDir = conf.handlersDir || './endpoints';
    loadRoutes(conf.handlersDir, restifyServer, params, cb);
  },
  'streamResponse': (res, next) => {
    res.on('finish', next);
    return jsr(res);
  },
  'jsonResponder': (res, next) => {
    return (err, result) => {
      if (err) {
        next(err);
        return;
      }
      else {
        res.send(httpSuccess, result);
      }
    };
  },
};
