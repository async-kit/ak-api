/*eslint max-nested-callbacks: ["error", 5]*/
const chai = require('chai');
const restify = require('restify');
const RestifyServer = require('restify/lib/server');
const entrypoint = require('../index');

const expect = chai.expect;
const assert = chai.assert;

const testServer = restify.createServer({name: 'testServer'});
const moduleType = typeof entrypoint;

describe('AK-API', () => {

  // index.js structure and behavior
  describe('entrypoint', () => {

    it('should be an object', () => {
      expect(moduleType).to.equal('object');
    });

    describe('validate configureServer method', () => {
      it('should exist', () => {
        expect(entrypoint).itself.to.respondTo('configureServer');
      });

      it('should throw an error if invoked without arguments', () => {
        expect(entrypoint.configureServer).to.throw();
      });

    });

    describe('validate streamResponse method', () => {
      it('should exist', () => {
        expect(entrypoint).itself.to.respondTo('streamResponse');
      });

      it('should throw an error if invoked without arguments', () => {
        expect(entrypoint.streamResponse).to.throw();
      });

      it('should throw an error if invoked with a non-stream argument', () => {
        const expectedResponse = 42;
        expect(() => {entrypoint.streamResponse(expectedResponse);}).to.throw();
      });

    });

    it('should execute without error given valid arguments', () => {

      const config = {
        handlersDir: './spec/data/definitions/valid',
      };

      assert.instanceOf(testServer, RestifyServer, 'using instance of Restify Server');
      expect(() => entrypoint.configureServer(testServer, config)).to.not.throw();
    });
  });

  // lib folder unit structure and behavior
  describe('submodule', () => {
    // eslint-disable-next-line global-require
    require('./lib/loadModules');
    // eslint-disable-next-line global-require
    require('./lib/hash_proxy_bcrypt');
  });

});
