const reassociateName = () => {};
const refreshMemory = () => {};

module.exports = function () {
  return {
    respondTo: 'PUT',
    endpoint: '/api/correct/:name',
    handledBy: [
      reassociateName,
      refreshMemory,
    ],
  };
};
