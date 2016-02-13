'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('Balances Service', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();

		env.stream = {
			on: sinon.stub(),
			end: sinon.stub()
		};
		env.collection = {
			update: sinon.stub()
		};
        env.repo = {
            select: sinon.stub(),
			selectTop: sinon.stub(),
			selectStream: sinon.stub().returns(Promise.accept({collection: env.collection, stream: env.stream})),
            update: sinon.stub()
        };
        env.Repository = sinon.stub().returns(env.repo);

		env.user = {
            username: 'testuser'
        };

		env.account = {
            "accountid": "1",
            "balance": 500.00,
            "lastActivity": {
				"transactionid": "9",
	            "type": "debit",
	            "amount": 50.00,
	            "when": new Date(),
				"balance": 450.00
            }
        };

        env.transactions = [
			{
				"_id": "01",
				"accountid": "1",
	            "transactionid": "1",
	            "type": "set",
	            "amount": 100.00,
	            "when": new Date(),
				"balance": 100.00
	        },
			{
				"_id": "02",
				"accountid": "1",
	            "transactionid": "2",
	            "type": "credit",
	            "amount": 100.00,
	            "when": new Date(),
				"balance": 200.00
	        },
			{
				"_id": "03",
				"accountid": "1",
	            "transactionid": "3",
	            "type": "credit",
	            "amount": 100.00,
	            "when": new Date(),
				"balance": 300.00
	        },
			{
				"_id": "04",
				"accountid": "1",
	            "transactionid": "4",
	            "type": "debit",
	            "amount": 50.00,
	            "when": new Date(),
				"balance": 250.00
	        },
			{
				"_id": "05",
				"accountid": "1",
	            "transactionid": "5",
	            "type": "debit",
	            "amount": 25.00,
	            "when": new Date(),
				"balance": 225.00
	        },
			{
				"_id": "06",
				"accountid": "1",
	            "transactionid": "6",
	            "type": "debit",
	            "amount": 25.00,
	            "when": new Date(),
				"balance": 200.00
	        },
			{
				"_id": "07",
				"accountid": "1",
	            "transactionid": "7",
	            "type": "credit",
	            "amount": 200.00,
	            "when": new Date(),
				"balance": 400.00
	        },
			{
				"_id": "08",
				"accountid": "1",
	            "transactionid": "8",
	            "type": "credit",
	            "amount": 100.00,
	            "when": new Date(),
				"balance": 500.00
	        },
			{
				"_id": "09",
				"accountid": "1",
	            "transactionid": "9",
	            "type": "debit",
	            "amount": 50.00,
	            "when": new Date(),
				"balance": 450.00
	        }
		];

        env.balances = sandbox.require('../../src/services/balances', {
            requires: {
                '../lib/repository': env.Repository,				
                '../lib/log': env.log
            }
        });
    });

    describe('create', () => {
		describe('set', () => {
			beforeEach((done) => {
				env.transaction = {
					"_id": "010",
		            "transactionid": "10",
		            "type": "set",
		            "amount": 300.00,
		            "when": new Date(),
					"balance": 0.00
		        };
				env.dbtransactions = [env.transaction].concat(env.transactions.slice(4));

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('create', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 300 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 275 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 250 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 450 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 550 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[5]._id},
					{$set: { balance: 500 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 500 }});
			});
		});
		describe('credit', () => {
			beforeEach((done) => {
				env.transaction = {
					"_id": "010",
		            "transactionid": "10",
		            "type": "credit",
		            "amount": 50.00,
		            "when": new Date(),
					"balance": 0.00
		        };
				env.dbtransactions = [env.transaction].concat(env.transactions.slice(4));

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.selectTop.returns(Promise.accept([env.transactions[3]]));
				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('create', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the previous transaction', () => {
				expect(env.repo.selectTop).to.have.been.calledWith(1, {when: {$lt: env.transaction.when}});
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 300 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 275 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 250 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 450 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 550 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[5]._id},
					{$set: { balance: 500 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 500 }});
			});
		});
		describe('debit', () => {
			beforeEach((done) => {
				env.transaction = {
					"_id": "010",
		            "transactionid": "10",
		            "type": "debit",
		            "amount": 50.00,
		            "when": new Date(),
					"balance": 0.00
		        };
				env.dbtransactions = [env.transaction].concat(env.transactions.slice(4));

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.selectTop.returns(Promise.accept([env.transactions[3]]));
				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('create', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the previous transaction', () => {
				expect(env.repo.selectTop).to.have.been.calledWith(1, {when: {$lt: env.transaction.when}});
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 200 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 175 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 150 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 350 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 450 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[5]._id},
					{$set: { balance: 400 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 400 }});
			});
		});
    });

	describe('update', () => {
		describe('set', () => {
			beforeEach((done) => {
				env.transaction = env.transactions[4];
				env.transactions[4].type = "set";
				env.transactions[4].amount = 300.00;
				env.dbtransactions = env.transactions.slice(4);

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('update', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 300 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 275 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 475 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 575 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 525 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 525 }});
			});
		});
		describe('credit', () => {
			beforeEach((done) => {
				env.transaction = env.transactions[4];
				env.transactions[4].type = "credit";
				env.transactions[4].amount = 50.00;
				env.dbtransactions = env.transactions.slice(4);

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.selectTop.returns(Promise.accept([env.transactions[3]]));
				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('update', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the previous transaction', () => {
				expect(env.repo.selectTop).to.have.been.calledWith(1, {when: {$lt: env.transaction.when}});
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 300 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 275 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 475 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 575 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 525 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 525 }});
			});
		});
		describe('debit', () => {
			beforeEach((done) => {
				env.transaction = env.transactions[4];
				env.transactions[4].type = "debit";
				env.transactions[4].amount = 50.00;
				env.dbtransactions = env.transactions.slice(4);

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.selectTop.returns(Promise.accept([env.transactions[3]]));
				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('update', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the previous transaction', () => {
				expect(env.repo.selectTop).to.have.been.calledWith(1, {when: {$lt: env.transaction.when}});
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 200 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 175 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 375 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 475 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 425 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 425 }});
			});
		});
    });

	describe('delete', () => {
		describe('set', () => {
			beforeEach((done) => {
				env.transaction = {
					"_id": "010",
		            "transactionid": "10",
		            "type": "set",
		            "amount": 300.00,
		            "when": new Date(),
					"balance": 300.00
		        };
				env.dbtransactions = env.transactions.slice(4);
				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.selectTop.returns(Promise.accept([env.transactions[3]]));
				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('remove', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 225 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 200 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 400 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 500 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 450 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 450 }});
			});
		});
		describe('credit', () => {
			beforeEach((done) => {
				env.transaction = {
					"_id": "010",
		            "transactionid": "10",
		            "type": "credit",
		            "amount": 50.00,
		            "when": new Date(),
					"balance": 300.00
		        };
				env.dbtransactions = env.transactions.slice(4);

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.selectTop.returns(Promise.accept([env.transactions[3]]));
				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('remove', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the previous transaction', () => {
				expect(env.repo.selectTop).to.have.been.calledWith(1, {when: {$lt: env.transaction.when}});
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 225 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 200 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 400 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 500 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 450 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 450 }});
			});
		});
		describe('debit', () => {
			beforeEach((done) => {
				env.transaction = {
					"_id": "010",
		            "transactionid": "10",
		            "type": "credit",
		            "amount": 50.00,
		            "when": new Date(),
					"balance": 300.00
		        };
				env.dbtransactions = env.transactions.slice(4);

				env.stream.on = (t,cb) => {
					if (t == 'data') {
						env.dbtransactions.forEach((v,i) => {
							cb(env.dbtransactions[i]);
						});
					} else if (t == 'end') {
						cb();
					}
				}
				sinon.spy(env.stream, 'on');

				env.repo.selectTop.returns(Promise.accept([env.transactions[3]]));
				env.repo.select.returns(Promise.accept([env.transaction]));
                env.repo.update.returns(Promise.accept());
				env.collection.update.yields(null,{});

				env.balances('remove', env.transaction, env.user)
				.then(()=>{done();})
				.catch(done);
			});

			it('should create the transaction repository', () => {
				expect(env.Repository).to.have.been.calledWith('transactions', env.user.username);
			});
			it('should select the previous transaction', () => {
				expect(env.repo.selectTop).to.have.been.calledWith(1, {when: {$lt: env.transaction.when}});
			});
			it('should select the transaction stream', () => {
				expect(env.repo.selectStream).to.have.been.calledWith({when: {$gte: env.transaction.when}});
			});
			it('should update the transactions', () => {
				expect(env.collection.update.callCount).to.equal(env.dbtransactions.length);

				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[0]._id},
					{$set: { balance: 225 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[1]._id},
					{$set: { balance: 200 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[2]._id},
					{$set: { balance: 400 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[3]._id},
					{$set: { balance: 500 }});
				expect(env.collection.update).to.have.been.calledWith({_id: env.dbtransactions[4]._id},
					{$set: { balance: 450 }});
			});
			it('should update the account', () => {
				expect(env.repo.update).to.have.been.calledOnce;
				expect(env.repo.update).to.have.been.calledWith({accountid: env.transaction.accountid},
					{$set: { balance: 450 }});
			});
		});
    });
});
