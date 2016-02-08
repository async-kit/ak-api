'use strict';

function associateNameFace() {}
function storeNameFace() {}

module.exports = function(server, options) {
  return {
    respondTo: 'POST',
    endpoint: '/api/remember/:name',
    handledBy: [
      associateNameFace,
      storeNameFace,
    ],
  };
};
