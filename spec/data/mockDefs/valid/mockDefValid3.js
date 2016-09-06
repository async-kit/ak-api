const reassociateName = () => {};
const refreshMemory = () => {};

module.exports = function () {
  return {
    respondTo: 'PUT',
    authMethod: 'Foo',
    endpoint: '/api/correct/:name',
    handledBy: [
      reassociateName,
      refreshMemory,
    ],
  };
};
