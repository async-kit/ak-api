const doPing = (req, res, next) => {
  res.send({message: 'Ping!'});
  next();
};

module.exports = function () {
  return {
    respondTo: 'GET',
    authMethod: 'localapikey',
    endpoint: '/api/ping',
    handledBy: doPing,
  };
};
