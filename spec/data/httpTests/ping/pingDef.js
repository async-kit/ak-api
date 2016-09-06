const doPing = (req, res, next) => {
  res.send({message: 'Ping!'});
  next();
};

module.exports = function () {
  return {
    respondTo: 'GET',
    authMethod: 'anonymous',
    endpoint: '/api/ping',
    handledBy: doPing,
  };
};
