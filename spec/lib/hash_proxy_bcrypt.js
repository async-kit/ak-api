const chai = require('chai');
const bcryptProxy = require('../../lib/hash_proxy_bcrypt');
const Logger = require('bunyan');

const should = chai.should();
const log = new Logger({
  name: 'helloapi',
  streams: [
    {
      stream: process.stdout,
      level: 'debug',
    },
  ],
});

const defaultRounds = 10;

module.exports = describe('"hashProxyBcrypt"', () => {

  it('should be a function', () => {
    bcryptProxy.should.be.a('function');
    //assert.typeOf(bcryptProxy, 'function');
  });

  it('should create a sane default bcrypt proxy', () => {
    const testProxy = bcryptProxy(log);
    testProxy.should.have.property('saltRounds');
    testProxy.saltRounds.should.equal(defaultRounds);
  });

  it('should create a bcrypt proxy with no fewer than 10 rounds', () => {
    const shortRounds = {
      saltRounds: 8,
    };
    const testProxy = bcryptProxy(log, shortRounds);
    testProxy.saltRounds.should.not.equal(shortRounds.saltRounds);
    testProxy.saltRounds.should.equal(defaultRounds);
  });

  it('should throw an error when passed a non-plain-object for options', () => {
    const testInteger = 42;
    const badOptions = [
      testInteger,
      Number,
      () => {},
      log,
      false,
      'this should fail',
      new Error('I am an error'),
    ];

    for (const badOpt of badOptions) {
      (() => {
        bcryptProxy(log, badOpt);
      }).should.throw(Error);

    }
  });

  it('should generate a hash that is not equal to the input string', (done) => {
    const rawValue = 'test string';
    const testProxy = bcryptProxy(log);

    testProxy.hash(rawValue, (err, hashedValue) => {
      should.not.exist(err);
      hashedValue.should.not.equal(rawValue);
      done();
    });
  });

  it('should compare the same strings successfully', (done) => {
    const rawValue = 'test string';
    const testProxy = bcryptProxy(log);

    testProxy.hash(rawValue, (hashErr, hashedValue) => {
      should.not.exist(hashErr);
      testProxy.compare(rawValue, hashedValue, (compareErr, matched) => {
        should.not.exist(compareErr);
        matched.should.equal(true);
        done();
      });
    });
  });

  it('should not compare 2 different strings successfully', (done) => {
    const rawValue = 'test string';
    const badValue = 'should not be same as rawValue variable';
    const testProxy = bcryptProxy(log);

    testProxy.hash(rawValue, (firstErr, hashedValue) => {
      should.not.exist(firstErr);
      testProxy.compare(badValue, hashedValue, (secondErr, matched) => {
        should.not.exist(secondErr);
        matched.should.equal(false);
        done();
      });
    });
  });

});
