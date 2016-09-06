const associateNameFace = () => {};
const storeNameFace = () => {};

module.exports = function () {
  return {
    respondTo: 'POST',
    authMethod: 'Foo',
    endpoint: '/api/remember/:name',
    handledBy: [
      associateNameFace,
      storeNameFace,
    ],
  };
};
