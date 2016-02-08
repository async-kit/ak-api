'use strict';

function sayHello() {}

module.exports = function(server, options) {
  return {
    respondTo: {},
    endpoint: '/api/hello/:name',
    handledBy: sayHello
  };
};
