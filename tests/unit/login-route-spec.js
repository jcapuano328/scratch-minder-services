'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('Login Route', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
        env.login = {
            login: sinon.stub()
        };
        env.user = {
            username: 'foo',
			firstname: 'fname',
			lastname: 'lname'
        };
        env.req = {
            body: {
                username: env.user.username,
                password: 'go'
            }
        };
        env.res = {
            send: sinon.stub()
        };
        env.next = sinon.stub();

        env.routes = sandbox.require('../../src/routes/login', {
            requires: {
                '../services/login': env.login,
                '../lib/log': env.log
            }
        });
    });

    describe('interface', () => {
        it('should have a single route', () => {
            expect(env.routes).to.be.an.array;
            expect(env.routes).to.have.length(1);
        });
        it('should have a method', () => {
            expect(env.routes[0]).to.have.property('method', 'post');
        });
        it('should have a uri', () => {
            expect(env.routes[0]).to.have.property('uri', '/login');
        });
        it('should not be protected', () => {
            expect(env.routes[0]).to.have.property('protected', false);
        });
        it('should have a handler', () => {
            expect(env.routes[0]).to.respondTo('handler');
        });
    });
    describe('handler', () => {
        beforeEach(() => {
            env.handler = env.routes[0].handler;
        });
        describe('success', () => {
            beforeEach((done) => {
                env.login.login.returns(Promise.accept(env.user));
                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should invoke the service', () => {
                expect(env.login.login).to.have.been.calledOnce;
                expect(env.login.login).to.have.been.calledWith(env.user.username, 'go');
            });
            it('should return a 200 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(200, sinon.match(env.user));
            });
        });
        describe('failure', () => {
			beforeEach((done) => {
                env.login.login.returns(Promise.reject({type: 'process', message: 'bad things'}));
                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should invoke the service', () => {
                expect(env.login.login).to.have.been.calledOnce;
                expect(env.login.login).to.have.been.calledWith(env.user.username, 'go');
            });
            it('should return a 401 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(401, sinon.match({type: 'process', message: 'bad things'}));
            });
        });
    });
});
