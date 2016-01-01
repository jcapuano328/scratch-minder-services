'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('OAuth Route', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
        env.req = {
            body: {
				grant_type: 'password',
                username: 'testuser',
                password: 'go'
            }
        };
        env.res = {
			set: sinon.stub(),
            send: sinon.stub()
        };
		env.res.set.returns(env.res);
        env.next = sinon.stub();

		env.oauth = {
			grant: sinon.stub()
		};
		env.token = {
			token_type: 'bearer',
			access_token: 'token123'
		};

        env.routes = sandbox.require('../../src/routes/oauth', {
            requires: {
                '../services/oauth2': env.oauth,
                '../lib/log': env.log
            }
        });
    });

    describe('interface', () => {
        it('should have a 2 routes', () => {
            expect(env.routes).to.be.an.array;
            expect(env.routes).to.have.length(2);
        });
		describe('grant', () => {
			it('should have a method', () => {
	            expect(env.routes[0]).to.have.property('method', 'post');
	        });
	        it('should have a uri', () => {
	            expect(env.routes[0]).to.have.property('uri', '/oauth/token');
	        });
	        it('should not be protected', () => {
	            expect(env.routes[0]).to.have.property('protected', false);
	        });
	        it('should have a handler', () => {
	            expect(env.routes[0]).to.respondTo('handler');
	        });
		});
		describe('verify', () => {
			it('should have a method', () => {
	            expect(env.routes[1]).to.have.property('method', 'post');
	        });
	        it('should have a uri', () => {
	            expect(env.routes[1]).to.have.property('uri', '/oauth/verify');
	        });
	        it('should not be protected', () => {
	            expect(env.routes[1]).to.have.property('protected', false);
	        });
	        it('should have a handler', () => {
	            expect(env.routes[1]).to.respondTo('handler');
	        });
		});
    });

    describe('handler', () => {
        beforeEach(() => {
            env.grant = env.routes[0].handler;
        });
        describe('success', () => {
            beforeEach((done) => {
				env.oauth.grant.returns(Promise.accept(env.token));

                env.grant(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should process the grant request', () => {
                expect(env.oauth.grant).to.have.been.calledOnce;
                expect(env.oauth.grant).to.have.been.calledWith(sinon.match({
					grant_type: env.req.body.grant_type,
					username: env.req.body.username,
					password: env.req.body.password,
					client_id: undefined,
					client_secret: undefined
				}));
            });
			it('should set the cache control', () => {
				expect(env.res.set).to.have.been.calledTwice;
				expect(env.res.set).to.have.been.calledWith('Cache-Control', 'no-store');
				expect(env.res.set).to.have.been.calledWith('Pragma', 'no-cache');
			});
            it('should return a 201 and token to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(201, sinon.match(env.token));
            });
        });

        describe('failure', () => {
            beforeEach((done) => {
                env.oauth.grant.returns(Promise.reject({type: 'process', message: 'bad things, man'}));

                env.grant(env.req,env.res,env.next)
                .then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process')
					expect(err).to.have.property('message', 'bad things, man')
					done();
				});
            });
			it('should process the grant request', () => {
                expect(env.oauth.grant).to.have.been.calledOnce;
                expect(env.oauth.grant).to.have.been.calledWith(sinon.match({
					grant_type: env.req.body.grant_type,
					username: env.req.body.username,
					password: env.req.body.password,
					client_id: undefined,
					client_secret: undefined
				}));
            });
            it('should return a 400 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({type: 'process', message: 'bad things, man'}));
            });
        });
    });
});
