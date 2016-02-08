'use strict';

module.exports = function(server, options) {
  return {
    respondTo: 'GET',
    endpoint: '/api/hello/:name',
    handledBy: 'handler',
  };
};
