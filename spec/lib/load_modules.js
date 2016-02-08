'use strict';

let mocha = require('mocha'),
    chai = require('chai'),
    restify = require('restify');

const expect = chai.expect,
    assert = chai.assert,
    entrypoint = require('../../index'),
    loadRoutes = require('../../lib/load_modules');

let testServer = restify.createServer();

module.exports = describe('"loadRoutes"', () => {

  beforeEach(() => {
    testServer = restify.createServer();
  });

  it('should be a function', () => {
    assert.typeOf(loadRoutes, 'function');
  });

  it('should return error when no endpoint definitions found', done => {
    loadRoutes('./endpoints', testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('No endpoint definitions found in ./endpoints.');
      done();
    });
  });

});
