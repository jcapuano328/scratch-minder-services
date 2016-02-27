'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('users route', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
		env.users = {
			create: sinon.stub(),
			read: sinon.stub(),
			readAll: sinon.stub(),
			update: sinon.stub(),
			remove: sinon.stub(),
			removeAll: sinon.stub(),
			resetPassword: sinon.stub()
		};

        env.routes = sandbox.require('../../src/routes/users', {
            requires: {
                '../services/users': env.users,
                '../lib/log': env.log
            }
        });
    });

    describe('interface', () => {
        it('should have a 6 routes', () => {
            expect(env.routes).to.be.an.array;
            expect(env.routes).to.have.length(7);
        });
        describe('create', () => {
            beforeEach(() => {
                env.route = env.routes[0];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'post');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/users');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('read', () => {
            beforeEach(() => {
                env.route = env.routes[1];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'get');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/users/:id');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('read for user', () => {
            beforeEach(() => {
                env.route = env.routes[2];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'get');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/users');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('update', () => {
            beforeEach(() => {
                env.route = env.routes[3];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'put');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/users/:id');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('delete', () => {
            beforeEach(() => {
                env.route = env.routes[4];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'del');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/users/:id');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('delete all for user', () => {
            beforeEach(() => {
                env.route = env.routes[5];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'del');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/users');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });

		describe('reset password for user', () => {
            beforeEach(() => {
                env.route = env.routes[6];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'put');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/users/:id/reset');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
    });

    describe('handlers', () => {
        beforeEach(() => {
            env.req = {
                body: {},
                params: {}
            };
            env.res = {
                send: sinon.stub()
            };
            env.next = sinon.stub();

            env.user = {
				"id": "user123",
                username: 'testuser'
            };
            env.dbuser = _.extend({_id: 'uniqueid'}, env.user);
        });

        describe('create', () => {
            beforeEach(() => {
                env.handler = env.routes[0].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.id = 'user123';
                    env.req.body = env.user;
                    env.users.create.returns(Promise.accept(env.dbuser));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
                it('should invoke the users service', () => {
                    expect(env.users.create).to.have.been.calledOnce;
                    expect(env.users.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return created to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(201, sinon.match(env.dbuser));
                });
            });

            describe('user id missing', () => {
                beforeEach((done) => {
					env.req.body = env.user;
					env.users.create.returns(Promise.reject({type: 'validation', message: 'user id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.create).to.have.been.calledOnce;
                    expect(env.users.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'user id missing'}));
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
                    env.req.params.id = 'user123';
                    env.req.body = null;
					env.users.create.returns(Promise.reject({type: 'validation', message: 'user missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.create).to.have.been.calledOnce;
                    expect(env.users.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'user missing'}));
                });
            });

            describe('user username missing', () => {
                beforeEach((done) => {
                    env.req.params.id = 'user123';
                    env.user.username = '';
                    env.req.body = env.user;
					env.users.create.returns(Promise.reject({type: 'validation', message: 'user username missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.create).to.have.been.calledOnce;
                    expect(env.users.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'user username missing'}));
                });
            });
        });

        describe('read', () => {
            beforeEach(() => {
                env.handler = env.routes[1].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.id = 'user123';
					env.users.read.returns(Promise.accept([env.dbuser]));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.read).to.have.been.calledOnce;
                    expect(env.users.read).to.have.been.calledWith(env.req.params);
                });
                it('should return user to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbuser]));
                });
            });

            describe('user id missing', () => {
				beforeEach((done) => {
					env.req.body = env.user;
					env.users.read.returns(Promise.reject({type: 'validation', message: 'user id missing'}));

					env.handler(env.req,env.res,env.next)
					.then(() => {done();})
					.catch(done);
				});
				it('should invoke the users service', () => {
					expect(env.users.read).to.have.been.calledOnce;
					expect(env.users.read).to.have.been.calledWith(env.req.params);
				});
				it('should return an error to the caller', () => {
					expect(env.res.send).to.have.been.calledOnce;
					expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'user id missing'}));
				});
            });
        });

        describe('read all', () => {
            beforeEach(() => {
                env.handler = env.routes[2].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
					env.users.readAll.returns(Promise.accept([env.dbuser, env.dbuser]));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
					expect(env.users.readAll).to.have.been.calledOnce;
					expect(env.users.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return users to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbuser,env.dbuser]));
                });
            });
        });

        describe('update', () => {
            beforeEach(() => {
                env.handler = env.routes[3].handler;
            });
            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.id = 'user123';
                    env.req.body = env.user;
                    env.users.update.returns(Promise.accept(env.dbuser));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
					expect(env.users.update).to.have.been.calledOnce;
					expect(env.users.update).to.have.been.calledWith(env.req.params,env.req.body);
				});
                it('should return updated to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match(env.dbuser));
                });
            });

            describe('user id missing', () => {
				beforeEach((done) => {
					env.req.body = env.user;
					env.users.update.returns(Promise.reject({type: 'validation', message: 'user id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
					expect(env.users.update).to.have.been.calledOnce;
					expect(env.users.update).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'user id missing'}));
                });
            });

            describe('user missing', () => {
				beforeEach((done) => {
                    env.req.params.id = 'user123';
                    env.req.body = null;
					env.users.update.returns(Promise.reject({type: 'validation', message: 'user missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.update).to.have.been.calledOnce;
                    expect(env.users.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'user missing'}));
                });
            });

            describe('user username missing', () => {
                beforeEach((done) => {
                    env.req.params.id = 'user123';
                    env.user.username = '';
                    env.req.body = env.user;
					env.users.update.returns(Promise.reject({type: 'validation', message: 'user username invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.update).to.have.been.calledOnce;
                    expect(env.users.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'user username invalid'}));
                });
            });
        });

        describe('delete', () => {
            beforeEach(() => {
                env.handler = env.routes[4].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.id = 'user123';
                    env.users.remove.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.remove).to.have.been.calledOnce;
                    expect(env.users.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });

            describe('user id missing', () => {
                beforeEach((done) => {
					env.users.remove.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.remove).to.have.been.calledOnce;
                    expect(env.users.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });
        });

        describe('delete all', () => {
            beforeEach(() => {
                env.handler = env.routes[5].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
					env.users.removeAll.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.removeAll).to.have.been.calledOnce;
                    expect(env.users.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });
        });

		describe('reset password', () => {
            beforeEach(() => {
                env.handler = env.routes[6].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
					env.req.params.id = 'user123';
                    env.req.body = {
						currentpwd: 'foo',
						newpwd: 'bar',
						confirmpwd: 'bar'
					};
					env.users.resetPassword.returns(Promise.accept(env.dbuser));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the users service', () => {
                    expect(env.users.resetPassword).to.have.been.calledOnce;
                    expect(env.users.resetPassword).to.have.been.calledWith(env.req.params, env.req.body);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, env.dbuser);
                });
            });
        });
    });
});
