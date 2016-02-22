'use strict';

function reassociateName() {}
function refreshMemory() {}

module.exports = function(server, options) {
  return {
    respondTo: 'PUT',
    endpoint: '/api/correct/:name',
    handledBy: [
      reassociateName,
      refreshMemory,
    ],
  };
};
