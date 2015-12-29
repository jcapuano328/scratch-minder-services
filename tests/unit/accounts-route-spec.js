'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('Accounts route', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
		env.accounts = {
			create: sinon.stub(),
			read: sinon.stub(),
			readAll: sinon.stub(),
			update: sinon.stub(),
			remove: sinon.stub(),
			removeAll: sinon.stub()
		};

        env.routes = sandbox.require('../../src/routes/accounts', {
            requires: {
                '../services/accounts': env.accounts,
                '../lib/log': env.log
            }
        });
    });

    describe('interface', () => {
        it('should have a 6 routes', () => {
            expect(env.routes).to.be.an.array;
            expect(env.routes).to.have.length(6);
        });
        describe('create', () => {
            beforeEach(() => {
                env.route = env.routes[0];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'post');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/accounts');
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
                expect(env.route).to.have.property('uri', '/user/:userid/accounts/:id');
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
                expect(env.route).to.have.property('uri', '/user/:userid/accounts');
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
                expect(env.route).to.have.property('uri', '/user/:userid/accounts/:id');
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
                expect(env.route).to.have.property('uri', '/user/:userid/accounts/:id');
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
                expect(env.route).to.have.property('uri', '/user/:userid/accounts');
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
                username: 'testuser'
            };
            env.account = {
                "accountid": "123",
                "number": "11111",
                "name": "Checking",
                "sequence": "2345",
                "balance": 5678.90,
                "lastActivity": {
                    "transactionid": "908028408",
                    "type": "set",
                    "sequence": "BAL",
                    "category": "Balance",
                    "description": "Set the opening balance",
                    "amount": 5678.90,
                    "when": new Date()
                }
            };

            env.dbaccount = _.extend({_id: 'uniqueid'}, env.user.account);
        });

        describe('create', () => {
            beforeEach(() => {
                env.handler = env.routes[0].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.account;
                    env.accounts.create.returns(Promise.accept(env.dbaccount));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
                it('should invoke the accounts service', () => {
                    expect(env.accounts.create).to.have.been.calledOnce;
                    expect(env.accounts.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return created to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(201, sinon.match(env.dbaccount));
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.req.body = env.account;
					env.accounts.create.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.create).to.have.been.calledOnce;
                    expect(env.accounts.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('account missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = null;
					env.accounts.create.returns(Promise.reject({type: 'validation', message: 'Account missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.create).to.have.been.calledOnce;
                    expect(env.accounts.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account missing'}));
                });
            });

            describe('account number missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.account.number = null;
                    env.req.body = env.account;
					env.accounts.create.returns(Promise.reject({type: 'validation', message: 'Account number invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.create).to.have.been.calledOnce;
                    expect(env.accounts.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account number invalid'}));
                });
            });

            describe('account name missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.account.name = '';
                    env.req.body = env.account;
					env.accounts.create.returns(Promise.reject({type: 'validation', message: 'Account name invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.create).to.have.been.calledOnce;
                    expect(env.accounts.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account name invalid'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.account;
					env.accounts.create.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(done)
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.create).to.have.been.calledOnce;
                    expect(env.accounts.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });

        describe('read', () => {
            beforeEach(() => {
                env.handler = env.routes[1].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'account123';
					env.accounts.read.returns(Promise.accept([env.dbaccount]));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.read).to.have.been.calledOnce;
                    expect(env.accounts.read).to.have.been.calledWith(env.req.params);
                });
                it('should return account to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbaccount]));
                });
            });

            describe('user missing', () => {
				beforeEach((done) => {
					env.req.body = env.account;
					env.accounts.read.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

					env.handler(env.req,env.res,env.next)
					.then(() => {done();})
					.catch(done);
				});
				it('should invoke the accounts service', () => {
					expect(env.accounts.read).to.have.been.calledOnce;
					expect(env.accounts.read).to.have.been.calledWith(env.req.params);
				});
				it('should return an error to the caller', () => {
					expect(env.res.send).to.have.been.calledOnce;
					expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
				});
            });

            describe('account missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.accounts.read.returns(Promise.reject({type: 'validation', message: 'Account id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.read).to.have.been.calledOnce;
					expect(env.accounts.read).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'account123';
					env.accounts.read.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.read).to.have.been.calledOnce;
					expect(env.accounts.read).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });

            describe('account not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'account123';
					env.accounts.read.returns(Promise.reject({type: 'process', message: 'Account not found'}));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.read).to.have.been.calledOnce;
					expect(env.accounts.read).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'Account not found'}));
                });
            });
        });

        describe('read all', () => {
            beforeEach(() => {
                env.handler = env.routes[2].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.accounts.readAll.returns(Promise.accept([env.dbaccount, env.dbaccount]));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.readAll).to.have.been.calledOnce;
					expect(env.accounts.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return accounts to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbaccount,env.dbaccount]));
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.accounts.readAll.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.readAll).to.have.been.calledOnce;
					expect(env.accounts.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.accounts.readAll.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.readAll).to.have.been.calledOnce;
					expect(env.accounts.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });

        describe('update', () => {
            beforeEach(() => {
                env.handler = env.routes[3].handler;
            });
            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.account;
                    env.accounts.update.returns(Promise.accept(env.dbaccount));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.update).to.have.been.calledOnce;
					expect(env.accounts.update).to.have.been.calledWith(env.req.params,env.req.body);
				});
                it('should return updated to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match(env.dbaccount));
                });
            });

            describe('user missing', () => {
				beforeEach((done) => {
					env.req.body = env.account;
					env.accounts.update.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
					expect(env.accounts.update).to.have.been.calledOnce;
					expect(env.accounts.update).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('account missing', () => {
				beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = null;
					env.accounts.update.returns(Promise.reject({type: 'validation', message: 'Account missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.update).to.have.been.calledOnce;
                    expect(env.accounts.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account missing'}));
                });
            });

            describe('account number missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.account.number = null;
                    env.req.body = env.account;
					env.accounts.update.returns(Promise.reject({type: 'validation', message: 'Account number invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.update).to.have.been.calledOnce;
                    expect(env.accounts.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account number invalid'}));
                });
            });

            describe('account name missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.account.name = '';
                    env.req.body = env.account;
					env.accounts.update.returns(Promise.reject({type: 'validation', message: 'Account name invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.update).to.have.been.calledOnce;
                    expect(env.accounts.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account name invalid'}));
                });
            });

            describe('user not found', () => {
				beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.account;
					env.accounts.update.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.update).to.have.been.calledOnce;
                    expect(env.accounts.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });

        describe('delete', () => {
            beforeEach(() => {
                env.handler = env.routes[4].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'account123';
                    env.accounts.remove.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.remove).to.have.been.calledOnce;
                    expect(env.accounts.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.accounts.remove.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.remove).to.have.been.calledOnce;
                    expect(env.accounts.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('account missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.accounts.remove.returns(Promise.reject({type: 'validation', message: 'Account id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.remove).to.have.been.calledOnce;
                    expect(env.accounts.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'account123';
					env.accounts.remove.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.remove).to.have.been.calledOnce;
                    expect(env.accounts.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });

        describe('delete all', () => {
            beforeEach(() => {
                env.handler = env.routes[5].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.accounts.removeAll.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.removeAll).to.have.been.calledOnce;
                    expect(env.accounts.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.accounts.removeAll.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.removeAll).to.have.been.calledOnce;
                    expect(env.accounts.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.accounts.removeAll.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the accounts service', () => {
                    expect(env.accounts.removeAll).to.have.been.calledOnce;
                    expect(env.accounts.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });
    });
});
