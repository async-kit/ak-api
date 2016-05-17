const forgetNameFace = () => {};

module.exports = function () {
  return {
    respondTo: 'DEL',
    endpoint: '/api/forget/:name',
    handledBy: forgetNameFace,
  };
};
