const glob = require('glob');
const _ = require('lodash');
const path = require('path');

// Simple type check models
// can be extended later as more props are allowed
const endpointDefTypeChecks = [
  {
    property: false,
    expected: 'object',
  },
  {
    property: 'respondTo',
    expected: 'string',
  },
  {
    property: 'authMethod',
    expected: 'string',
  },
  {
    property: 'endpoint',
    expected: 'string',
  },
  {
    property: 'handledBy',
    expected: 'function',
    arrOK: true,
  },
];

const validateAuthMethods = (methodsDict) => {
  const middlewareArgsLen = 3;
  if (!_.isPlainObject(methodsDict)) {
    return new Error('Authorization method parameter is not a plain object');
  }
  if (!Object.getOwnPropertyNames(methodsDict).length) {
    return new Error('No authorization methods passed in.');
  }
  for (const key of Object.getOwnPropertyNames(methodsDict)) {
    const value = methodsDict[key];
    if (typeof value !== 'function') {
      return new Error(`Authorization method ${key} is a ${typeof value} not a function.`);
    }
    if (value.length !== middlewareArgsLen) {
      // eslint-disable-next-line max-len
      return new Error(`Authorization method ${key} is not a proper 3-argument restify middleware function.`);
    }
  }
  return null;
};

const loadModuleFromGlobFile = (fileName, restifyServer, options) => {
  const startFilePos = 0;
  const endFilePos = -3;
  const actualFile = path.resolve(process.cwd(), fileName.slice(startFilePos, endFilePos));
  // eslint-disable-next-line global-require
  return require(actualFile)(restifyServer, options);
};

// Endpoint definitions must be validated (preferably in an extensible way)
// TODO: when supported, add destructuring to the functions in here
// TODO: needs value checks (e.g. valid "respondTo" values are limited)
const failedEndpointDef = (obj) => {
  let failed = null;
  // If type validation fails we return the error below
  const flagType = (check) => {
    // eslint-disable-next-line max-len
    failed = new Error(`Endpoint definition's ${check.itemName} has a value type of ${check.actual} and must be a(n) ${check.expected}.`);
    return true;
  };

  // Validation must accept a single type value or array of type values
  const validateType = (check) => {
    if (check.arrOK && Array.isArray(check.actual)) {
      check.actual.some((type) => {
        return validateType(Object.assign({}, check, {
          actual: type,
        }));
      });

    }
    else if (check.actual !== check.expected) {
      return flagType(check);
    }
    return false;
  };

  // Only gets array item types if "arrOK" flag is set
  const getType = (check) => {

    const target = check.property ? obj && obj[check.property] : obj;

    if (check.arrOK && Array.isArray(target)) {
      check.actual = target.map((item) => typeof item);
    }
    else {
      check.actual = typeof target;
    }

    return check;
  };

  // Name derived from property
  const getName = (check) => {

    check.itemName = !check.property ?
        'return value' : ['', check.property, ' property'].join('"');

    return check;
  };

  endpointDefTypeChecks
      .map(getName)
      .map(getType)
      .some(validateType);

  return failed;
};

const failedEndpointAuth = (curDef, defFileName, authMethods) => {
  const authMethod = authMethods[curDef.authMethod];
  if (!authMethod) {
    // eslint-disable-next-line max-len
    return new Error(`Authorization method ${curDef.authMethod} requested for endpoint ${curDef.endpoint} in file ${defFileName} not available.`);
  }
  if (typeof authMethod !== 'function') {
    // eslint-disable-next-line max-len
    return new Error(`Authorization method ${curDef.authMethod} requested for endpoint ${curDef.endpoint} in file ${defFileName} is not a function.`);
  }
  return false;
};

// eslint-disable-next-line max-len, max-params
const loadEndpointFromDef = (curDef, localRestifyApp, authMethods, curFileName, endpointMap) => {
  // This will work fine as long as there is never an HTTP verb with the pipe symbol in it
  const endpointKey = `${curDef.respondTo}|${curDef.endpoint}`;
  if (endpointMap.has(endpointKey)) {
    // eslint-disable-next-line max-len
    return new Error(endpointKey, curFileName, `Duplicate route ${endpointKey} loaded in file ${curFileName}`);
  }
  // eslint-disable-next-line max-len
  localRestifyApp[curDef.respondTo.toLowerCase()](curDef.endpoint, authMethods[curDef.authMethod], curDef.handledBy);
  endpointMap.set(endpointKey, curDef);
  return null;
};

// eslint-disable-next-line max-params
module.exports = function loadRoutes(directoryName, authMethods, restifyApp, extraParams, cb) {
  const badAuth = validateAuthMethods(authMethods);
  if (badAuth) {
    return cb(badAuth, null);
  }

  const endpointsLoaded = new Map();
  glob(`${directoryName}/**/*.js`, (err, files) => {

    // Let user know if no definitions are found
    if (!files.length) {
      return cb(new Error(`No endpoint definitions found in ${directoryName}.`), null);
    }

    let loadError = null;
    for (const curFile of files) {
      loadError = null;
      const module = loadModuleFromGlobFile(curFile, restifyApp, extraParams);

      // We can have either an object defining an endpoint, or an array of them.  Wrap the raw
      // object in an array so they can be handled identically.
      for (const curDef of Array.isArray(module) ? module : [module]) {
        // We can only proceed using valid endpoint objects
        loadError = failedEndpointDef(curDef) || failedEndpointAuth(curDef, curFile, authMethods);

        if (!loadError) {
          // eslint-disable-next-line max-len
          loadError = loadEndpointFromDef(curDef, restifyApp, authMethods, curFile, endpointsLoaded);
        }

        if (loadError) {
          break;
        }
      }
    }
    if (loadError) {
      return cb(loadError, null);
    }
    return cb(null, { endPoints: endpointsLoaded });
  });

  return restifyApp;

};
