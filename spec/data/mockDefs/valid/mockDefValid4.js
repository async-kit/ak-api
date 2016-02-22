'use strict';

function forgetNameFace() {}

module.exports = function(server, options) {
  return {
    respondTo: 'DEL',
    endpoint: '/api/forget/:name',
    handledBy: forgetNameFace,
  };
};
