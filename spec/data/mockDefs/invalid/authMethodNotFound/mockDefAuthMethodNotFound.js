module.exports = function () {
  return {
    respondTo: 'GET',
    authMethod: 'Foo',
    endpoint: '/api/hello/:name',
    handledBy: () => {},
  };
};
