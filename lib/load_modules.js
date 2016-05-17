const glob = require('glob');
const _ = require('highland');
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
    property: 'endpoint',
    expected: 'string',
  },
  {
    property: 'handledBy',
    expected: 'function',
    arrOK: true,
  },
];

// eslint-disable-next-line max-params
module.exports = function loadRoutes(directoryName, restifyApp, extraParams, cb) {
  glob(`${directoryName}/**/*.js`, (err, files) => {
    const endpointsLoaded = new Map();

    const loadModuleFromGlobFile = (fileName, restifyServer, options) => {
      const startFilePos = 0;
      const endFilePos = -3;
      const actualFile = path.resolve(process.cwd(), fileName.slice(startFilePos, endFilePos));
      // eslint-disable-next-line global-require
      return require(actualFile)(restifyServer, options);
    };

    // Endpoint definitions must be validated (preferrably in an extensible way)
    // TODO: when supported, add destructuring to the functions in here
    // TODO: needs value checks (e.g. valid "respondTo" values are limited)
    const validateEndpointDef = (obj) => {

      let failed = false;

      // If type validation fails we return the error below
      const flagType = (check) => {
        failed = true;
        // eslint-disable-next-line max-len
        cb(new Error(`Endpoint definition's ${check.itemName} has a value type of ${check.actual} and must be a(n) ${check.expected}.`));
        return failed;
      };

      // Validation must accept a single type value or array of type values
      // TODO (2016-05-16 Jonathan) Make return consistent, remove eslint disable
      // eslint-disable-next-line consistent-return
      const validateType = (check) => {
        if (check.arrOK && Array.isArray(check.actual)) {
          check.actual.forEach((type) => {
            validateType(Object.assign({}, check, {
              actual: type,
            }));
          });

        }
        else if (check.actual !== check.expected) {
          return flagType(check);
        }
      };

      // Only gets array item types if "arrOK" flag is set
      const getType = (check) => {

        const target = obj && obj[check.property] || obj;

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

      return !failed;
    };

    const loadEndpointFromDef = (curDef, localRestifyApp, curFileName) => {
      // This will work fine as long as there is never an HTTP verb with the pipe symbol in it
      const endpointKey = `${curDef.respondTo}|${curDef.endpoint}`;
      if (endpointsLoaded.has(endpointKey)) {
        // eslint-disable-next-line max-len
        cb(new Error(endpointKey, curFileName, `Duplicate route ${endpointKey} loaded in file ${curFileName}`));
        return;
      }
      localRestifyApp[curDef.respondTo.toLowerCase()](curDef.endpoint, curDef.handledBy);
      endpointsLoaded.set(endpointKey, curDef);
      return;
    };

    // Let user know if no definitions are found
    if (!files.length) {
      return cb(new Error(`No endpoint definitions found in ${directoryName}.`));
    }

    _(files).each((curFile) => {
      const module = loadModuleFromGlobFile(curFile, restifyApp, extraParams);

      // We can have either an object defining an endpoint, or an array of them.  Wrap the raw
      // object in an array so they can be handled identically.
      const endpointObjs = Array.isArray(module) ? module : [module];

      // This could/should eventually be pushed out of here and just have the array streamed out and
      // and chain a call after this to load up each endpoint.  For expediency because that would
      // require passing the current file name for error handling along, we're ust going to do the
      // highland operation as a sub-loop.
      _(endpointObjs).each((curDef) => {
        // We can only proceed using valid endpoint objects
        if (validateEndpointDef(curDef)) {
          loadEndpointFromDef(curDef, restifyApp, curFile);
        }
      });
    }).done(() => {
      if (_.isFunction(cb)) {
        cb(null, {
          endPoints: endpointsLoaded,
        });
        return;
      }
    });
    return true;
  });

};
