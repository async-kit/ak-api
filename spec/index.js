'use strict';

let mocha = require('mocha'),
    chai = require('chai'),
    restify = require('restify'),
    RestifyServer = require('restify/lib/server'),
    entrypoint = require('../index');

const expect = chai.expect,
    assert = chai.assert,

    testServer = restify.createServer({name: 'testServer'}),
    moduleType = typeof entrypoint;

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
        expect(() => {entrypoint.streamResponse(42)}).to.throw();
      });

    });

    it('should execute without error given valid arguments', () => {

      let config = {
        handlersDir: './spec/data/definitions/valid',
      };

      assert.instanceOf(testServer, RestifyServer, 'using instance of Restify Server');
      expect(() => entrypoint.configureServer(testServer, config)).to.not.throw();
    });
  });

  // lib folder unit structure and behavior
  describe('submodule', () => {
    require('./lib/load_modules');
  });
});
