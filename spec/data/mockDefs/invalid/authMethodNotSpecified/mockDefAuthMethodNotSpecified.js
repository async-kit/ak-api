module.exports = function () {
  return {
    respondTo: 'GET',
    endpoint: '/api/hello/:name',
    handledBy: () => {},
  };
};
