'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('Transactions Service', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();

        env.repo = {
            select: sinon.stub(),
            insert: sinon.stub(),
            update: sinon.stub(),
            remove: sinon.stub(),
            save: sinon.stub()
        };
        env.Repository = sinon.stub().returns(env.repo);

		env.user = {
            username: 'testuser'
        };
        env.transaction = {
            "transactionid": "908028408",
			"accountid": "abc123",
            "type": "set",
            "sequence": "BAL",
            "category": "Balance",
            "description": "Set the opening balance",
            "amount": 5678.90,
            "when": new Date()
        };
        env.dbtransaction = _.extend({_id: 'uniqueid'}, env.transaction);

		env.params = {};

		env.balances = sinon.stub().returns(Promise.accept());

		env.crudServices = sandbox.require('../../src/lib/crud-services', {
			requires: {
				'../lib/repository': env.Repository,
				'../lib/log': env.log
			}
		});
        env.service = sandbox.require('../../src/services/transactions', {
            requires: {
                '../lib/crud-services': env.crudServices,
				'../services/balances': env.balances,
				'lodash': _,
                '../lib/log': env.log
            }
        });
    });

    describe('interface', () => {
        it('should have a create', () => {
            expect(env.service).to.respondTo('create');
        });
		it('should have a read', () => {
            expect(env.service).to.respondTo('read');
        });
		it('should have a readAll', () => {
            expect(env.service).to.respondTo('readAll');
        });
		it('should have a update', () => {
            expect(env.service).to.respondTo('update');
        });
		it('should have a remove', () => {
            expect(env.service).to.respondTo('remove');
        });
		it('should have a removeAll', () => {
            expect(env.service).to.respondTo('removeAll');
        });
    });

    describe('create', () => {
        beforeEach(() => {
            env.handler = env.service.create;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.repo.select.returns(Promise.accept([env.user]));
                env.repo.insert.returns(Promise.accept(env.dbtransaction));

                env.handler(env.params,env.transaction)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledTwice;
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should create the transactions repository', () => {
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should insert the data', () => {
                expect(env.repo.insert).to.have.been.calledOnce;
                expect(env.repo.insert).to.have.been.calledWith(env.transaction);
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params,env.transaction)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('transaction missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.handler(env.params)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('transaction sequence missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.transaction.sequence = null;
				env.handler(env.params, env.transaction)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction sequence invalid');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('transaction description missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.transaction.description = '';
				env.handler(env.params, env.transaction)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction description invalid');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params, env.transaction)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledOnce;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should not create the transactions repository', () => {
                expect(env.Repository).to.not.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the transaction', () => {
                expect(env.repo.select).to.not.have.been.calledWith({transactionid: 'transaction123'});
            });
        });
    });

    describe('read', () => {
        beforeEach(() => {
            env.handler = env.service.read;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'transaction123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.dbtransaction]));

                env.handler(env.params)
				.then((result) => {
					env.result = result;
					done();
				})
				.catch(done);
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledTwice;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should create the transactions repository', () => {
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the transaction', () => {
                expect(env.repo.select).to.have.been.calledWith({transactionid: 'transaction123'});
            });
            it('should return transaction', () => {
                expect(env.result).to.exist;
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
        });

        describe('transaction missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'transaction123';
                env.repo.select.onFirstCall().returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledOnce;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should not create the transactions repository', () => {
                expect(env.Repository).to.not.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the transaction', () => {
                expect(env.repo.select).to.not.have.been.calledWith({transactionid: 'transaction123'});
            });
        });

        describe('transaction not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'transaction123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'transactions not found');
					done();
				});
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledTwice;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should create the transactions repository', () => {
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the transaction', () => {
                expect(env.repo.select).to.have.been.calledWith({transactionid: 'transaction123'});
            });
        });
    });

    describe('read all', () => {
        beforeEach(() => {
            env.handler = env.service.readAll;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.dbtransaction, env.dbtransaction]));

				env.handler(env.params)
				.then((result) => {
					env.result = result;
					done();
				})
				.catch(done);
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledTwice;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should create the transactions repository', () => {
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the transaction', () => {
                expect(env.repo.select).to.have.been.calledWith({});
            });
            it('should return transactions', () => {
                expect(env.result).to.exist;
				expect(env.result).to.be.an.array;
				expect(env.result).to.have.length(2);
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.onFirstCall().returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledOnce;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should not create the transactions repository', () => {
                expect(env.Repository).to.not.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the transaction', () => {
                expect(env.repo.select).to.not.have.been.calledWith({});
            });
        });
    });

    describe('update', () => {
        beforeEach(() => {
            env.handler = env.service.update;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.params.id = 'transaction123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.save.returns(Promise.accept(env.dbtransaction));

                env.handler(env.params,env.transaction)
                .then((result) => {
					env.result = result;
					done();
				})
                .catch(done);
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledTwice;
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should create the transactions repository', () => {
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should save the data', () => {
                expect(env.repo.save).to.have.been.calledOnce;
                expect(env.repo.save).to.have.been.calledWith(env.transaction);
            });
            it('should return the transaction', () => {
                expect(env.result).to.exist;
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.handler(env.params,env.transaction)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('transaction missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('transaction sequence missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.transaction.sequence = null;

				env.handler(env.params,env.transaction)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction sequence invalid');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('transaction description missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.transaction.description = '';

				env.handler(env.params,env.transaction)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction description invalid');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params,env.transaction)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledOnce;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should not create the transactions repository', () => {
                expect(env.Repository).to.not.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the transaction', () => {
                expect(env.repo.select).to.not.have.been.calledWith({transactionid: 'transaction123'});
            });
			it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            env.handler = env.service.remove;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'transaction123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.params)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledTwice;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should create the transactions repository', () => {
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should remove the transaction', () => {
                expect(env.repo.remove).to.have.been.calledWith({transactionid: 'transaction123'});
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete transaction', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });

        describe('transaction missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Transaction id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete transaction', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'transaction123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledOnce;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should not create the transactions repository', () => {
                expect(env.Repository).to.not.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not delete transaction', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });
    });

    describe('remove all', () => {
        beforeEach(() => {
            env.handler = env.service.removeAll;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.params)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledTwice;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should create the transactions repository', () => {
                expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should remove the transactions', () => {
                expect(env.repo.remove).to.have.been.calledWith({});
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete transaction', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledOnce;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should not create the transactions repository', () => {
                expect(env.Repository).to.not.have.been.calledWith('transactions', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not delete transaction', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });
    });
});
