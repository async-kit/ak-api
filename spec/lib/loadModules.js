const chai = require('chai');
const restify = require('restify');

const expect = chai.expect;
const assert = chai.assert;

const loadRoutes = require('../../lib/loadModules');
let testServer = restify.createServer();
const akApi = require('../../index.js');

module.exports = describe('"loadRoutes"', () => {

  beforeEach(() => {
    testServer = restify.createServer();
  });

  it('should be a function', () => {
    assert.typeOf(loadRoutes, 'function');
  });

  it('should return error when no endpoint definitions found', (done) => {
    // eslint-disable-next-line no-unused-vars
    loadRoutes('./endpoints', { 'Foo': (req, res, next) => {} }, testServer, null, (err) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('No endpoint definitions found in ./endpoints.');
      done();
    });
  });

  it('should return error when endpoint def returns the wrong type', (done) => {
    // eslint-disable-next-line max-len, no-unused-vars
    loadRoutes('./spec/data/mockDefs/invalid/return', { 'Foo': (req, res, next) => {} }, testServer, null, (err) => {
      expect(err).to.be.an.instanceOf(Error);
      // eslint-disable-next-line max-len
      expect(err.message).to.equal('Endpoint definition\'s return value has a value type of string and must be a(n) object.');
      done();
    });
  });

  it('should return error when def.respondTo is the wrong type', (done) => {
    // eslint-disable-next-line max-len, no-unused-vars
    loadRoutes('./spec/data/mockDefs/invalid/respondTo', { 'Foo': (req, res, next) => {} }, testServer, null, (err) => {
      expect(err).to.be.an.instanceOf(Error);
      // eslint-disable-next-line max-len
      expect(err.message).to.equal('Endpoint definition\'s "respondTo" property has a value type of object and must be a(n) string.');
      done();
    });
  });

  it('should return error when def.endpoint is the wrong type', (done) => {
    // eslint-disable-next-line max-len, no-unused-vars
    loadRoutes('./spec/data/mockDefs/invalid/endpoint', { 'Foo': (req, res, next) => {} }, testServer, null, (err) => {
      expect(err).to.be.an.instanceOf(Error);
      // eslint-disable-next-line max-len
      expect(err.message).to.equal('Endpoint definition\'s "endpoint" property has a value type of object and must be a(n) string.');
      done();
    });
  });

  it('should return error when def.handledBy is the wrong type', (done) => {
    const multiplier = 2;
    const additive = 1;
    const variant = Math.floor(Math.random() * multiplier) + additive;
    const mockDefDir = [
      './spec/data/mockDefs/invalid/handledBy',
      variant.toString(),
    ].join('');

    // eslint-disable-next-line no-unused-vars
    loadRoutes(mockDefDir, { 'Foo': (req, res, next) => {} }, testServer, null, (err) => {
      expect(err).to.be.an.instanceOf(Error);
      // eslint-disable-next-line max-len
      expect(err.message).to.equal('Endpoint definition\'s "handledBy" property has a value type of string and must be a(n) function.');
      done();
    });
  });

  it('should throw an error when there are no authorization methods', (done) => {
    loadRoutes('./spec/data/mockDefs/valid', {}, testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(data).to.be.null; // eslint-disable-line no-unused-expressions
      expect(err.message).to.equal('No authorization methods passed in.');
      done();
    });
  });

  it('should throw an error when authorization methods are not functions', (done) => {
    loadRoutes('./spec/data/mockDefs/valid', {'Foo': true }, testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(data).to.be.null; // eslint-disable-line no-unused-expressions
      // eslint-disable-next-line max-len
      expect(err.message).to.equal('Authorization method Foo is a boolean not a function.');
      done();
    });
  });

  it('should throw an error when no authorization method is specified', (done) => {
    // eslint-disable-next-line max-len, no-unused-vars
    loadRoutes('./spec/data/mockDefs/invalid/authMethodNotSpecified', { 'Foo': (req, res, next) => {} },
        testServer, null, (err, data) => {
          expect(err).to.be.an.instanceOf(Error);
          expect(data).to.be.null; // eslint-disable-line no-unused-expressions
          // eslint-disable-next-line max-len
          expect(err.message).to.equal('Endpoint definition\'s "authMethod" property has a value type of undefined and must be a(n) string.');
          done();
        });
  });

  it('should throw an error when specified authorization method is not available', (done) => {
    // eslint-disable-next-line max-len
    loadRoutes('./spec/data/mockDefs/invalid/authMethodNotFound', akApi.initAuthWithAnonymous(), testServer, null, (err, data) => {
      expect(err).to.be.an.instanceOf(Error);
      expect(data).to.be.null; // eslint-disable-line no-unused-expressions
      // eslint-disable-next-line max-len
      expect(err.message).to.equal('Authorization method Foo requested for endpoint /api/hello/:name in file ./spec/data/mockDefs/invalid/authMethodNotFound/mockDefAuthMethodNotFound.js not available.');
      done();
    });
  });

  it('should not throw an error when definitions provide valid properties', (done) => {
    // eslint-disable-next-line max-len, no-unused-vars
    loadRoutes('./spec/data/mockDefs/valid', {'Foo': (req, res, next) => {} }, testServer, null, (err, data) => {
      expect(err).to.equal(null);
      expect(data).to.be.an('object');
      done();
    });
  });

});
