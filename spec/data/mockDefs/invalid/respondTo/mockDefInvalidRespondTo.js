module.exports = function () {
  return {
    respondTo: {},
    authMethod: 'Foo',
    endpoint: '/api/hello/:name',
    handledBy: () => {},
  };
};
