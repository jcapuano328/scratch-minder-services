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
		env.username = 'foo';
		env.password = 'go';
        env.crypto = {
            verify: sinon.stub()
        };
        env.users = {
            select: sinon.stub()
        };
        env.dbuser = {
            username: env.username,
            status: 'active',
            password: {
                salt: '123',
                hash: 'abc'
            }
        };

        env.login = sandbox.require('../../src/services/login', {
            requires: {
                '../lib/password': env.crypto,
                '../lib/repository': sinon.stub().returns(env.users),
                '../lib/log': env.log
            }
        });
    });

    describe('interface', () => {
        it('should have a login handler', () => {
            expect(env.login).to.respondTo('login');
        });
    });
    describe('login', () => {
        beforeEach(() => {
            env.login = env.login.login;
        });
        describe('success', () => {
            beforeEach((done) => {
                env.users.select.returns(Promise.accept([env.dbuser]));
                env.crypto.verify.returns(Promise.accept(true));

                env.login(env.username,env.password)
                .then((result) => {
					env.user = result;
					done();
				})
                .catch(done);
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.username}));
            });
            it('should verify the password', () => {
                expect(env.crypto.verify).to.have.been.calledOnce;
                expect(env.crypto.verify).to.have.been.calledWith(env.password, env.dbuser.password.salt, env.dbuser.password.hash);
            });
            it('should return user to the caller', () => {
                expect(env.user).to.exist;
            });
        });

        describe('invalid user', () => {
            beforeEach((done) => {
                env.users.select.returns(Promise.accept([]));

				env.login(env.username,env.password)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.username}));
            });
            it('should not verify the password', () => {
                expect(env.crypto.verify).to.not.have.been.called;
            });
        });

        describe('user account locked', () => {
            beforeEach((done) => {
                env.dbuser.status = 'locked';
                env.users.select.returns(Promise.accept([env.dbuser]));

				env.login(env.username,env.password)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'Account is locked');
					done();
				});
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.username}));
            });
            it('should not verify the password', () => {
                expect(env.crypto.verify).to.not.have.been.called;
            });
        });

        describe('user account inactive', () => {
            beforeEach((done) => {
                env.dbuser.status = 'inactive';
                env.users.select.returns(Promise.accept([env.dbuser]));

				env.login(env.username,env.password)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'Account is inactive');
					done();
				});
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.username}));
            });
            it('should not verify the password', () => {
                expect(env.crypto.verify).to.not.have.been.called;
            });
        });

        describe('invalid password', () => {
            beforeEach((done) => {
                env.users.select.returns(Promise.accept([env.dbuser]));
                env.crypto.verify.returns(Promise.accept(false));

				env.login(env.username,env.password)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'Invalid Username/Password');
					done();
				});
            });
            it('should fetch the user', () => {
                expect(env.users.select).to.have.been.calledOnce;
                expect(env.users.select).to.have.been.calledWith(sinon.match({username: env.username}));
            });
            it('should verify the password', () => {
                expect(env.crypto.verify).to.have.been.calledOnce;
                expect(env.crypto.verify).to.have.been.calledWith(env.password, env.dbuser.password.salt, env.dbuser.password.hash);
            });
        });
    });
});
