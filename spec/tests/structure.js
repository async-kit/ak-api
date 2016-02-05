'use strict';

let mocha = require('mocha'),
    chai = require('chai'),
    restify = require('restify'),
    Server = require('restify/lib/server'),
    endpointModule = require('../../index');

const expect = chai.expect,
    assert = chai.assert,

    testServer = restify.createServer({name: 'testServer'}),
    moduleType = typeof endpointModule;

module.exports = describe('Basic Module Structure and Behavior', () => {

  it('should not throw an error', () => {
    expect(endpointModule).to.not.throw();
  });

  it('should return a function', () => {
    expect(moduleType).to.equal('function');
  });

  it('should return fn that returns object given a single argument of a restify server', () => {
    assert.instanceOf(testServer, Server, 'using instance of Restify Server as 1st argument');
    assert.typeOf(endpointModule(testServer), 'object', 'function returns an object');
  });

});
