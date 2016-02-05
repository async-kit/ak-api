'use strict';

var mocha = require('mocha'),
  chai = require('chai'),
  expect = chai.expect,
  assert = chai.assert,
  should = chai.should();

const AccessControl = describe('Access Control', function () {

  it('should work', function () {
    expect(1).to.equal(1);
  });

  it('should not work', function () {
    expect(1).to.equal(2);
  });

});

module.exports = AccessControl;
