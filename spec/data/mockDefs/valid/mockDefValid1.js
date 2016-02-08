'use strict';

function sayHello() {}

module.exports = function(server, options) {
  return {
    respondTo: 'GET',
    endpoint: '/api/hello/:name',
    handledBy: sayHello,
  };
};
