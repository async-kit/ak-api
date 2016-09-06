const forgetNameFace = () => {};

module.exports = function () {
  return {
    respondTo: 'DEL',
    authMethod: 'Foo',
    endpoint: '/api/forget/:name',
    handledBy: forgetNameFace,
  };
};
