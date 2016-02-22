'use strict';

let mocha = require('mocha'),
    chai = require('chai'),
    restify = require('restify');

const expect = chai.expect,
    assert = chai.assert;

let entrypoint = require('../../index'),
    loadRoutes = require('../../lib/load_modules'),
    testServer = restify.createServer();

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

  it('should return error when endpoint def returns the wrong type', done => {
    loadRoutes('./spec/data/mockDefs/invalid/return', testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Endpoint definition\'s return value has a value type of string and must be a(n) object.');
      done();
    });
  });

  it('should return error when def.respondTo is the wrong type', done => {
    loadRoutes('./spec/data/mockDefs/invalid/respondTo', testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Endpoint definition\'s "respondTo" property has a value type of object and must be a(n) string.');
      done();
    });
  });

  it('should return error when def.endpoint is the wrong type', done => {
    loadRoutes('./spec/data/mockDefs/invalid/endpoint', testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Endpoint definition\'s "endpoint" property has a value type of object and must be a(n) string.');
      done();
    });
  });

  it('should return error when def.handledBy is the wrong type', done => {

    let variant = Math.floor(Math.random() * 2) + 1,
        mockDefDir = [
          './spec/data/mockDefs/invalid/handledBy',
          variant.toString(),
        ].join('');

    loadRoutes(mockDefDir, testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Endpoint definition\'s "handledBy" property has a value type of string and must be a(n) function.');
      done();
    });
  });

  it('should not throw an error when definitions provide valid properties', done => {
    loadRoutes('./spec/data/mockDefs/valid', testServer, null, (err, data) => {
      expect(err).to.equal(null);
      expect(data).to.be.an('object');
      done();
    });
  });

});
