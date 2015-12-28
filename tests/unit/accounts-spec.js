/*
'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('Accounts Service', () => {
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
        env.respository = sinon.stub().returns(env.repo);

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

		env.params = {};

        env.service = sandbox.require('../../src/services/accounts', {
            requires: {
                '../lib/repository': env.respository,
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
                env.repo.insert.returns(Promise.accept(env.dbaccount));

                env.handler(env.params,env.account)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should create the accounts respository', () => {
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should insert the data', () => {
                expect(env.repo.insert).to.have.been.calledOnce;
                expect(env.repo.insert).to.have.been.calledWith(env.account);
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params,env.account)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('account missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.handler(env.params)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Account missing');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('account number missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.account.number = null;
				env.handler(env.params, env.account)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Account number invalid');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('account name missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.account.name = '';
				env.handler(env.params, env.account)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'Account name invalid');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
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

				env.handler(env.params, env.account)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the accounts respository', () => {
                expect(env.respository).to.not.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the account', () => {
                expect(env.repo.select).to.not.have.been.calledWith({accountid: 'account123'});
            });
        });
    });

    describe('read', () => {
        beforeEach(() => {
            env.handler = env.service[1].handler;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'account123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.dbaccount]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the accounts respository', () => {
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the account', () => {
                expect(env.repo.select).to.have.been.calledWith({accountid: 'account123'});
            });
            it('should return account to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(200, sinon.match(env.dbaccount));
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
            });
        });

        describe('account missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';

                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account id missing'}));
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'account123';
                env.repo.select.onFirstCall().returns(Promise.accept([]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the accounts respository', () => {
                expect(env.respository).to.not.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the account', () => {
                expect(env.repo.select).to.not.have.been.calledWith({accountid: 'account123'});
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
            });
        });

        describe('account not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'account123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the accounts respository', () => {
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the account', () => {
                expect(env.repo.select).to.have.been.calledWith({accountid: 'account123'});
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'Account not found'}));
            });
        });
    });

    describe('read all', () => {
        beforeEach(() => {
            env.handler = env.service[2].handler;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.dbaccount, env.dbaccount]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the accounts respository', () => {
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the account', () => {
                expect(env.repo.select).to.have.been.calledWith({});
            });
            it('should return accounts to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbaccount,env.dbaccount]));
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.onFirstCall().returns(Promise.accept([]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the accounts respository', () => {
                expect(env.respository).to.not.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the account', () => {
                expect(env.repo.select).to.not.have.been.calledWith({});
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
            });
        });
    });

    describe('update', () => {
        beforeEach(() => {
            env.handler = env.service[3].handler;
        });
        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.req.body = env.account;
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.save.returns(Promise.accept(env.dbaccount));

                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should create the accounts respository', () => {
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should save the data', () => {
                expect(env.repo.save).to.have.been.calledOnce;
                expect(env.repo.save).to.have.been.calledWith(env.account);
            });
            it('should return created to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(201, sinon.match(env.dbaccount));
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.req.body = env.account;

                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
            });
        });

        describe('account missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.req.body = null;

                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account missing'}));
            });
        });

        describe('account number missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.account.number = null;
                env.req.body = env.account;

                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account number invalid'}));
            });
        });

        describe('account name missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.account.name = '';
                env.req.body = env.account;

                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account name invalid'}));
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.req.body = env.account;
                env.repo.select.returns(Promise.accept([]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the accounts respository', () => {
                expect(env.respository).to.not.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the account', () => {
                expect(env.repo.select).to.not.have.been.calledWith({accountid: 'account123'});
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
            });
        });
    });

    describe('delete', () => {
        beforeEach(() => {
            env.handler = env.service[4].handler;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'account123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the accounts respository', () => {
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should remove the account', () => {
                expect(env.repo.remove).to.have.been.calledWith({accountid: 'account123'});
            });
            it('should return result to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(200, sinon.match({accountid: 'account123'}));
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete account', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
            });
        });

        describe('account missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';

                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete account', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Account id missing'}));
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'account123';
                env.repo.select.returns(Promise.accept([]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the accounts respository', () => {
                expect(env.respository).to.not.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not delete account', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
            });
        });
    });

    describe('delete all', () => {
        beforeEach(() => {
            env.handler = env.service[5].handler;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the accounts respository', () => {
                expect(env.respository).to.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should remove the accounts', () => {
                expect(env.repo.remove).to.have.been.calledWith({});
            });
            it('should return result to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(200);
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.handler(env.req,env.res,env.next)
                .then(() => {done();})
                .catch(done);
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete account', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([]));

                env.handler(env.req,env.res,env.next)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the accounts respository', () => {
                expect(env.respository).to.not.have.been.calledWith('accounts', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not delete account', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
            it('should return an error to the caller', () => {
                expect(env.res.send).to.have.been.calledOnce;
                expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
            });
        });
    });
});
*/
