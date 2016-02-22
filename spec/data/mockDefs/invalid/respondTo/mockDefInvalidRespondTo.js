'use strict';

module.exports = function(server, options) {
  return {
    respondTo: {},
    endpoint: '/api/hello/:name',
    handledBy: () => {},
  };
};
