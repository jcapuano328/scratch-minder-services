'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('Transactions route', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
		env.transactions = {
			create: sinon.stub(),
			read: sinon.stub(),
			readAll: sinon.stub(),
			update: sinon.stub(),
			remove: sinon.stub(),
			removeAll: sinon.stub()
		};

        env.routes = sandbox.require('../../src/routes/transactions', {
            requires: {
				'lodash': _,
                '../services/transactions': env.transactions,
                '../lib/log': env.log
            }
        });
    });

    describe('interface', () => {
        it('should have a 9 routes', () => {
            expect(env.routes).to.be.an.array;
            expect(env.routes).to.have.length(9);
        });
        describe('create', () => {
            beforeEach(() => {
                env.route = env.routes[0];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'post');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/account/:accountid/transactions');
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
                expect(env.route).to.have.property('uri', '/user/:userid/account/:accountid/transactions/:id');
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
                expect(env.route).to.have.property('uri', '/user/:userid/account/:accountid/transactions');
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
                expect(env.route).to.have.property('uri', '/user/:userid/account/:accountid/transactions/:id');
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
                expect(env.route).to.have.property('uri', '/user/:userid/account/:accountid/transactions/:id');
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
                expect(env.route).to.have.property('uri', '/user/:userid/account/:accountid/transactions');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
		describe('search', () => {
            beforeEach(() => {
                env.route = env.routes[6];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'get');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/accounts/:accountid/transactions/search/:kind/:search');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
		describe('range', () => {
            beforeEach(() => {
                env.route = env.routes[7];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'get');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/accounts/:accountid/transactions/startdate/:startdate/enddate/:enddate');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
		describe('summary', () => {
            beforeEach(() => {
                env.route = env.routes[8];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'get');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/accounts/:accountid/transactions/startdate/:startdate/enddate/:enddate/:groupby');
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
            env.transaction = {
                "accountid": "123",
                "transactionid": "908028408",
                "type": "set",
                "sequence": "BAL",
                "category": "Balance",
                "description": "Set the opening balance",
                "amount": 5678.90,
                "when": new Date()
            };

            env.dbtransaction = _.extend({_id: 'uniqueid'}, env.transaction);
        });

        describe('create', () => {
            beforeEach(() => {
                env.handler = env.routes[0].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.req.params.accountid = 'account123';
                    env.req.body = env.transaction;
                    env.transactions.create.returns(Promise.accept(env.dbtransaction));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
                it('should invoke the transactions service', () => {
                    expect(env.transactions.create).to.have.been.calledOnce;
                    expect(env.transactions.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return created to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(201, sinon.match(env.dbtransaction));
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.req.body = env.transaction;
					env.transactions.create.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.create).to.have.been.calledOnce;
                    expect(env.transactions.create).to.have.been.calledWith(env.req.params,env.req.body);
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
					env.transactions.create.returns(Promise.reject({type: 'validation', message: 'Account missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.create).to.have.been.calledOnce;
                    expect(env.transactions.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account missing'}));
                });
            });

            describe('account number missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.transaction.number = null;
                    env.req.body = env.transaction;
					env.transactions.create.returns(Promise.reject({type: 'validation', message: 'Account number invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.create).to.have.been.calledOnce;
                    expect(env.transactions.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account number invalid'}));
                });
            });

            describe('account name missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.transaction.name = '';
                    env.req.body = env.transaction;
					env.transactions.create.returns(Promise.reject({type: 'validation', message: 'Account name invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.create).to.have.been.calledOnce;
                    expect(env.transactions.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account name invalid'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.transaction;
					env.transactions.create.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(done)
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.create).to.have.been.calledOnce;
                    expect(env.transactions.create).to.have.been.calledWith(env.req.params,env.req.body);
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
					env.transactions.read.returns(Promise.accept([env.dbtransaction]));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.read).to.have.been.calledOnce;
                    expect(env.transactions.read).to.have.been.calledWith(env.req.params);
                });
                it('should return account to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbtransaction]));
                });
            });

            describe('user missing', () => {
				beforeEach((done) => {
					env.req.body = env.transaction;
					env.transactions.read.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

					env.handler(env.req,env.res,env.next)
					.then(() => {done();})
					.catch(done);
				});
				it('should invoke the transactions service', () => {
					expect(env.transactions.read).to.have.been.calledOnce;
					expect(env.transactions.read).to.have.been.calledWith(env.req.params);
				});
				it('should return an error to the caller', () => {
					expect(env.res.send).to.have.been.calledOnce;
					expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
				});
            });

            describe('account missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.transactions.read.returns(Promise.reject({type: 'validation', message: 'Account id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.read).to.have.been.calledOnce;
					expect(env.transactions.read).to.have.been.calledWith(env.req.params);
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
					env.transactions.read.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.read).to.have.been.calledOnce;
					expect(env.transactions.read).to.have.been.calledWith(env.req.params);
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
					env.transactions.read.returns(Promise.reject({type: 'process', message: 'Account not found'}));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.read).to.have.been.calledOnce;
					expect(env.transactions.read).to.have.been.calledWith(env.req.params);
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
					env.transactions.readAll.returns(Promise.accept([env.dbtransaction, env.dbtransaction]));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.readAll).to.have.been.calledOnce;
					expect(env.transactions.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return transactions to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbtransaction,env.dbtransaction]));
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.transactions.readAll.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.readAll).to.have.been.calledOnce;
					expect(env.transactions.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.transactions.readAll.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.readAll).to.have.been.calledOnce;
					expect(env.transactions.readAll).to.have.been.calledWith(env.req.params);
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
                    env.req.body = env.transaction;
                    env.transactions.update.returns(Promise.accept(env.dbtransaction));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.update).to.have.been.calledOnce;
					expect(env.transactions.update).to.have.been.calledWith(env.req.params,env.req.body);
				});
                it('should return updated to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match(env.dbtransaction));
                });
            });

            describe('user missing', () => {
				beforeEach((done) => {
					env.req.body = env.transaction;
					env.transactions.update.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
					expect(env.transactions.update).to.have.been.calledOnce;
					expect(env.transactions.update).to.have.been.calledWith(env.req.params);
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
					env.transactions.update.returns(Promise.reject({type: 'validation', message: 'Account missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.update).to.have.been.calledOnce;
                    expect(env.transactions.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account missing'}));
                });
            });

            describe('account number missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.transaction.number = null;
                    env.req.body = env.transaction;
					env.transactions.update.returns(Promise.reject({type: 'validation', message: 'Account number invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.update).to.have.been.calledOnce;
                    expect(env.transactions.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account number invalid'}));
                });
            });

            describe('account name missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.transaction.name = '';
                    env.req.body = env.transaction;
					env.transactions.update.returns(Promise.reject({type: 'validation', message: 'Account name invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.update).to.have.been.calledOnce;
                    expect(env.transactions.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account name invalid'}));
                });
            });

            describe('user not found', () => {
				beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.transaction;
					env.transactions.update.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.update).to.have.been.calledOnce;
                    expect(env.transactions.update).to.have.been.calledWith(env.req.params,env.req.body);
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
                    env.transactions.remove.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.remove).to.have.been.calledOnce;
                    expect(env.transactions.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.transactions.remove.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.remove).to.have.been.calledOnce;
                    expect(env.transactions.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('account missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.transactions.remove.returns(Promise.reject({type: 'validation', message: 'Account id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.remove).to.have.been.calledOnce;
                    expect(env.transactions.remove).to.have.been.calledWith(env.req.params);
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
					env.transactions.remove.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.remove).to.have.been.calledOnce;
                    expect(env.transactions.remove).to.have.been.calledWith(env.req.params);
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
					env.transactions.removeAll.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.removeAll).to.have.been.calledOnce;
                    expect(env.transactions.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.transactions.removeAll.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.removeAll).to.have.been.calledOnce;
                    expect(env.transactions.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.transactions.removeAll.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the transactions service', () => {
                    expect(env.transactions.removeAll).to.have.been.calledOnce;
                    expect(env.transactions.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });
    });
});
