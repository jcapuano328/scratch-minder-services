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
        env.crypto = {
            verify: sinon.stub()
        };
        env.users = {
            select: sinon.stub()
        };
        env.user = {
            username: 'foo',
            status: 'active',
            password: {
                salt: '123',
                hash: 'abc'
            }
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
                'easy-pbkdf2': sinon.stub().returns(env.crypto),
                '../lib/repository': sinon.stub().returns(env.users),
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
            env.login = env.routes[0].handler;
        });
        describe('success', () => {
            beforeEach((done) => {
                env.users.select.returns(Promise.accept([env.user]));
                env.crypto.verify.yields(null, true);

                env.login(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.user.username}));
            });
            it('should verify the password', () => {
                expect(env.crypto.verify).to.have.been.calledOnce;
                expect(env.crypto.verify).to.have.been.calledWith(env.user.password.salt, env.user.password.hash, env.req.body.password, sinon.match.func);
            });
            it('should return a 200 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(200);
            });
        });
        describe('invalid user', () => {
            beforeEach((done) => {
                env.users.select.returns(Promise.accept([]));

                env.login(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.user.username}));
            });
            it('should not verify the password', () => {
                expect(env.crypto.verify).to.not.have.been.called;
            });
            it('should return a 401 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(401, sinon.match({"message": 'User not found'}));
            });
        });
        describe('user account locked', () => {
            beforeEach((done) => {
                env.user.status = 'locked';
                env.users.select.returns(Promise.accept([env.user]));

                env.login(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.user.username}));
            });
            it('should not verify the password', () => {
                expect(env.crypto.verify).to.not.have.been.called;
            });
            it('should return a 401 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(401, sinon.match({"message": 'Account is locked'}));
            });
        });
        describe('user account inactive', () => {
            beforeEach((done) => {
                env.user.status = 'inactive';
                env.users.select.returns(Promise.accept([env.user]));

                env.login(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.user.username}));
            });
            it('should not verify the password', () => {
                expect(env.crypto.verify).to.not.have.been.called;
            });
            it('should return a 401 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(401, sinon.match({"message": 'Account is inactive'}));
            });
        });
        describe('invalid password', () => {
            beforeEach((done) => {
                env.users.select.returns(Promise.accept([env.user]));
                env.crypto.verify.yields(null, false);

                env.login(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.user.username}));
            });
            it('should verify the password', () => {
                expect(env.crypto.verify).to.have.been.calledOnce;
                expect(env.crypto.verify).to.have.been.calledWith(env.user.password.salt, env.user.password.hash, env.req.body.password, sinon.match.func);
            });
            it('should return a 401 to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(401, sinon.match({"message": 'Invalid Username/Password'}));
            });
        });
    });
});
