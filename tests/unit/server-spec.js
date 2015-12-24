'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
	path = require('path');
chai.use(require('sinon-chai'));
var promise = require('../mocks/promise.js');

describe('Server', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
        env.config = {
            port: 8888
        };
        env.restifyServer = {
			use: sinon.stub(),
	        get: sinon.stub(),
	        post: sinon.stub(),
            put: sinon.stub(),
            del: sinon.stub(),
	        close: sinon.stub(),
	        listen: sinon.stub()
		};
		env.restify = {
			createServer: sinon.stub().returns(env.restifyServer),
	        queryParser: sinon.stub().returns('queryparser'),
	        bodyParser: sinon.stub().returns('bodyparser'),
	        gzipResponse: sinon.stub().returns('gzipresponse')
		};
        env.router = {
            register: sinon.stub()
        };

        env.server = sandbox.require('../../lib/server', {
			requires: {
                'config': env.config,
                'restify': env.restify,
                './router': env.router,
                './log': env.log
            }
		});
    });
    afterEach(() => {
        env.server.stop();
    });

    describe('start', () => {
        describe('success', () => {
            beforeEach(() => {
                env.router.register.returns(Promise.resolve());
                env.restifyServer.listen.yields(null);
                return env.server.start();
    			//.then(() => { done(); })
    			//.catch(done);
            });
            it('should create the restify server', () => {
                expect(env.restify.createServer).to.have.been.calledOnce;
            });
            it('should use the query parser', () => {
                expect(env.restify.queryParser).to.have.been.calledOnce;
                expect(env.restifyServer.use).to.have.been.calledWith('queryparser');
            });
            it('should use the body parser', () => {
                expect(env.restify.bodyParser).to.have.been.calledOnce;
                expect(env.restifyServer.use).to.have.been.calledWith('bodyparser');
            });
            it('should use the gzip response', () => {
                expect(env.restify.gzipResponse).to.have.been.calledOnce;
                expect(env.restifyServer.use).to.have.been.calledWith('gzipresponse');
            });
            it('should register the routes', () => {
                expect(env.router.register).to.have.been.calledOnce;
            });
            it('should listen on the proper port', () => {
                expect(env.restifyServer.listen).to.have.been.calledOnce;
                expect(env.restifyServer.listen).to.have.been.calledWith(env.config.port);
            });
        });

        describe('invalid routes', () => {
            beforeEach((done) => {
                env.router.register.returns(Promise.reject('bad things, man'));
                env.server.start()
    			.then(() => { done('should have throw an exception'); })
    			.catch((err) => { expect(err).to.equal('bad things, man'); done();});
            });
            it('should create the restify server', () => {
                expect(env.restify.createServer).to.have.been.calledOnce;
            });
            it('should use the query parser', () => {
                expect(env.restify.queryParser).to.have.been.calledOnce;
                expect(env.restifyServer.use).to.have.been.calledWith('queryparser');
            });
            it('should use the body parser', () => {
                expect(env.restify.bodyParser).to.have.been.calledOnce;
                expect(env.restifyServer.use).to.have.been.calledWith('bodyparser');
            });
            it('should use the gzip response', () => {
                expect(env.restify.gzipResponse).to.have.been.calledOnce;
                expect(env.restifyServer.use).to.have.been.calledWith('gzipresponse');
            });
            it('should register the routes', () => {
                expect(env.router.register).to.have.been.calledOnce;
            });
            it('should not listen on the port', () => {
                expect(env.restifyServer.listen).to.not.have.been.called;
            });
        });

        //it('should accept connections');
    });

    describe('stop', () => {
        it('should stop listening');
    });
});