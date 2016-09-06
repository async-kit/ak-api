/*eslint max-nested-callbacks: ["error", 7]*/
const chai = require('chai');
const restify = require('restify');
const RestifyServer = require('restify/lib/server');
const entrypoint = require('../index');
const NeverStrategy = require('passport-localapikey').Strategy;

const expect = chai.expect;
const assert = chai.assert;

let testServer;
const moduleType = typeof entrypoint;

describe('AK-API', () => {
  beforeEach(() => {
    testServer = restify.createServer({name: 'testServer'});
    // runs before each test in this block
  });

  afterEach(() => {
    testServer.close();
  });

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

    /*
    describe('validate authentication setup methods', () => {
      it('should execute without error given valid arguments', () => {
      });
    });
    */

    it('should execute without error given valid arguments', () => {

      const config = {
        handlersDir: './spec/data/definitions/valid',
        authMethods: entrypoint.initAuthWithAnonymous(),
      };

      assert.instanceOf(testServer, RestifyServer, 'using instance of Restify Server');
      expect(() => entrypoint.configureServer(testServer, config, {}, () => {})).to.not.throw();
    });

    describe('ensure basic http functionality', () => {
      const testPort = 8124;

      it('should respond correctly to a valid route', (done) => {

        const config = {
          handlersDir: './spec/data/httpTests/ping',
          authMethods: entrypoint.initAuthWithAnonymous(),
        };
        const expectedStatus = 200;

        expect(testServer).to.be.instanceOf(RestifyServer);
        entrypoint.configureServer(testServer, config, {}, (err, epl) => {
          expect(err).to.be.null; // eslint-disable-line
          expect(epl).to.be.object; // eslint-disable-line no-unused-expressions
          testServer.listen(testPort, () => {
            const client = restify.createJsonClient({
              url: `http://localhost:${testPort}`,
              version: '*',
            });
            expect(client).to.be.object; // eslint-disable-line no-unused-expressions
            // eslint-disable-next-line max-params
            client.get('/api/ping', (err2, req, res, obj) => {
              expect(err2).to.not.be.err; // eslint-disable-line no-unused-expressions
              expect(res.statusCode).to.equal(expectedStatus);
              expect(obj).to.be.object; // eslint-disable-line no-unused-expressions
              expect(JSON.stringify(obj)).to.equal(JSON.stringify({message: 'Ping!'}));
              done();
            });
          });
        });
      });

      it('should 404 on an invalid route', (done) => {

        const config = {
          handlersDir: './spec/data/httpTests/ping',
          authMethods: entrypoint.initAuthWithAnonymous(),
        };
        const expectedStatus = 404;
        const message404 = {
          code: 'ResourceNotFound',
          message: '/api/not_here does not exist',
        };

        expect(testServer).to.be.instanceOf(RestifyServer);
        entrypoint.configureServer(testServer, config, {}, (err, epl) => {
          expect(err).to.be.null; // eslint-disable-line no-unused-expressions
          expect(epl).to.be.object; // eslint-disable-line no-unused-expressions
          testServer.listen(testPort, () => {
            const client = restify.createJsonClient({
              url: `http://localhost:${testPort}`,
              version: '*',
            });
            expect(client).to.be.object; // eslint-disable-line no-unused-expressions
            // eslint-disable-next-line max-params
            client.get('/api/not_here', (err2, req, res, obj) => {
              expect(err2).to.not.be.err; // eslint-disable-line no-unused-expressions
              expect(res.statusCode).to.equal(expectedStatus);
              expect(obj).to.be.object; // eslint-disable-line no-unused-expressions
              expect(JSON.stringify(obj)).to.equal(JSON.stringify(message404));
              done();
            });
          });
        });
      });

      it('should 401 on a route which fails authentication', (done) => {

        let authMethods = entrypoint.initAuthWithAnonymous();
        const myNeverStrategy = new NeverStrategy(
            (apikey, cb) => {
              return cb(null, false);
            }
        );
        authMethods = entrypoint.loadPassportStrategy(authMethods, myNeverStrategy, 'alwaysReject');
        const config = {
          handlersDir: './spec/data/httpTests/failedAuth',
          authMethods,
        };
        const expectedStatus = 401;
        const message401 = {};

        expect(testServer).to.be.instanceOf(RestifyServer);
        entrypoint.configureServer(testServer, config, {}, (err, epl) => {
          expect(err).to.be.null; // eslint-disable-line no-unused-expressions
          expect(epl).to.be.object; // eslint-disable-line no-unused-expressions
          testServer.listen(testPort, () => {
            const client = restify.createJsonClient({
              url: `http://localhost:${testPort}`,
              version: '*',
            });
            expect(client).to.be.object; // eslint-disable-line no-unused-expressions
            // eslint-disable-next-line max-params
            client.get('/api/ping', (err2, req, res, obj) => {
              expect(err2).to.not.be.err; // eslint-disable-line no-unused-expressions
              expect(res.statusCode).to.equal(expectedStatus);
              expect(obj).to.be.object; // eslint-disable-line no-unused-expressions
              expect(JSON.stringify(obj)).to.equal(JSON.stringify(message401));
              done();
            });
          });
        });
      });

      it('should use the passport strategy name if no other given', (done) => {

        let authMethods = entrypoint.initAuthWithAnonymous();
        const myNeverStrategy = new NeverStrategy(
            (apikey, cb) => {
              return cb(null, false);
            }
        );
        authMethods = entrypoint.loadPassportStrategy(authMethods, myNeverStrategy);
        const config = {
          handlersDir: './spec/data/httpTests/usePpStrategyName',
          authMethods,
        };
        const expectedStatus = 401;
        const message401 = {};

        expect(testServer).to.be.instanceOf(RestifyServer);
        entrypoint.configureServer(testServer, config, {}, (err, epl) => {
          expect(err).to.be.null; // eslint-disable-line no-unused-expressions
          expect(epl).to.be.object; // eslint-disable-line no-unused-expressions
          testServer.listen(testPort, () => {
            const client = restify.createJsonClient({
              url: `http://localhost:${testPort}`,
              version: '*',
            });
            expect(client).to.be.object; // eslint-disable-line no-unused-expressions
            // eslint-disable-next-line max-params
            client.get('/api/ping', (err2, req, res, obj) => {
              expect(err2).to.not.be.err; // eslint-disable-line no-unused-expressions
              expect(res.statusCode).to.equal(expectedStatus);
              expect(obj).to.be.object; // eslint-disable-line no-unused-expressions
              expect(JSON.stringify(obj)).to.equal(JSON.stringify(message401));
              done();
            });
          });
        });
      });

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
