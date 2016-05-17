const associateNameFace = () => {};
const storeNameFace = () => {};

module.exports = function () {
  return {
    respondTo: 'POST',
    endpoint: '/api/remember/:name',
    handledBy: [
      associateNameFace,
      storeNameFace,
    ],
  };
};
