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

    it('should be a function', () => {
      expect(moduleType).to.equal('function');
    });

    it('should throw an error if invoked without arguments', () => {
      expect(entrypoint).to.throw();
    });
  });

  // lib folder unit structure and behavior
  describe('submodule', () => {
    require('./lib/load_modules');
  });
});
