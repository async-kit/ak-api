'use strict';

var glob = require('glob'),
    _ = require('highland'),
    path = require('path')
;

module.exports = function loadRoutes(directoryName, restifyApp, cb) {
  glob(directoryName + '/**/*.js', function (err, files) {
    let endpointsLoaded = new Map();
    _(files).each(function(curFile){
      let actualFile = path.resolve(process.cwd(), curFile.slice(0, -3));
      let module = require(actualFile)(restifyApp, {});

      // We can have either an object defining an endpoint, or an array of them.  Wrap the raw object
      // in an array so they can be handled identically.
      let endpointObjs = Array.isArray(module) ? module : [module];

      // This could/should eventually be pushed out of here and just have the array streamed out and
      // and chain a call after this to load up each endpoint.  For expediency because that would require
      // passing the current file name for error handling along, we're ust going to do the highland
      // operation as a sub-loop.
      _(endpointObjs).each(function(curDef){
        // This will work fine as long as there is never an HTTP verb with the pipe symbol in it
        let endpointKey = `${curDef.respondTo}|${curDef.endpoint}`;
        if (endpointsLoaded.has(endpointKey)) {
          throw new Error(endpointKey, curFile, 'Duplicate route ' + endpointKey + ' loaded in file ' + curFile);
        }
        endpointsLoaded.set(endpointKey, curDef);

      });
    }).done(function(){
      cb(null, endpointsLoaded);
    });
  });

};
