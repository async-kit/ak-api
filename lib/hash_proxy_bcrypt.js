const bcrypt = require('bcrypt');
const _ = require('lodash');

const sanitizeOptions = (logger, opts) => {
  const options = _.isUndefined(opts) ? {} : opts;

  if (!_.isPlainObject(options)) {
    // eslint-disable-next-line max-len
    logger.fatal({'options passed': options}, 'The options passed in were not a plain object (e.g. created via {}');
    return null;
  }

  return _.cloneDeep(options);
};

module.exports = function (logger, passedOptions) {
  const minSaltRounds = 10;
  const log = logger;
  const options = sanitizeOptions(logger, passedOptions);

  if (_.isNull(options)) {
    throw new Error(`Invalid options passed to module: ${passedOptions}`);
  }

  if (!options.saltRounds || !Number.isInteger(options.saltRounds)) {
    // eslint-disable-next-line max-len
    log.info({ 'passed options': options }, `Salt rounds not specified in options, or not an integer, setting to ${minSaltRounds}`);
    options.saltRounds = 10;
  }

  if (options.saltRounds < minSaltRounds) {
    // eslint-disable-next-line max-len
    log.warn(options, `Insufficient number of salt rounds passed in options, setting to ${minSaltRounds}`);
    options.saltRounds = minSaltRounds;
  }

  return {
    hash: (sourceValue, cb) => {
      bcrypt.hash(sourceValue, options.saltRounds, cb);
    },
    compare: bcrypt.compare,
    saltRounds: options.saltRounds,
  };
};
