const loadRoutes = require('./lib/loadModules');
const jsr = require('json-stream-response');

const httpSuccess = 200;

let passport = null;
const getPassportInstance = () => {
  // eslint-disable-next-line global-require
  passport = passport || require('passport-restify');
  return passport;
};

const loadPassportStrategy = (authMethods, strategyInstance, friendlyName) => {
  authMethods = authMethods || {};

  getPassportInstance().use(strategyInstance);
  friendlyName = friendlyName || strategyInstance.name;
  authMethods[friendlyName] = getPassportInstance().authenticate(strategyInstance.name);

  return authMethods;

};

module.exports = {
  // eslint-disable-next-line max-params
  'configureServer': (restifyServer, conf, params, cb) => {

    // throw descriptive error when config not provided
    // TODO: maybe replace this with config defaults
    if (typeof conf === 'undefined') {
      throw new Error('Config not provided.');
    }

    conf.handlersDir = conf.handlersDir || './endpoints';
    conf.authMethods = conf.authMethods || {};
    loadRoutes(conf.handlersDir, conf.authMethods, restifyServer, params, cb);
  },
  loadPassportStrategy,
  'initAuthWithAnonymous': () => {
    return {
      'anonymous': (req, res, next) => {
        return next();
      },
    };
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
