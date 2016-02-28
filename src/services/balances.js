'use strict'
var Repository = require('../lib/repository'),
    log = require('../lib/log');
/*
create
	set
		retrieve the txns >= current txn when (should include current txn)
		for each txn
			if the first txn
				set the balance to the amount
				set the running balance to the balance
			else
				set the running balance to the running balance +/- the txn amount
				set the txn balance to the running balance
			update the txn
		set account current balance to running balance
		update the account

	credit/debit
		retrieve the first txn < current txn when (prev txn)
		set running balance to prev txn balance
		retrieve the txns >= current txn when (should include current txn)
		for each txn
			set the running balance to the running balance +/- the txn amount
			set the txn balance to the running balance
			update the txn
		set account current balance to running balance
		update the account

update
	set
		retrieve the txns >= current txn when (should include current txn)
		for each txn
			if the first txn
				set the balance to the amount
				set the running balance to the balance
			else
				set the running balance to the running balance +/- the txn amount
				set the txn balance to the running balance
			update the txn
		set account current balance to running balance
		update the account

	credit/debit
		retrieve the first txn < current txn when (prev txn)
		set running balance to prev txn balance
		retrieve the txns >= current txn when (should include current txn)
		for each txn
			set the running balance to the running balance +/- the txn amount
			set the txn balance to the running balance
			update the txn
		set account current balance to running balance
		update the account

delete
	set/credit/debit
		retrieve the first txn < current txn when (prev txn)
		set running balance to prev txn balance
		retrieve the txns >= current txn when (should include current txn)
		for each txn
			set the running balance to the running balance +/- the txn amount
			set the txn balance to the running balance
			update the txn
		set account current balance to running balance
		update the account
*/
let adjust = (balance, type, amount) => {
    balance = typeof balance == 'string' ? parseFloat(balance) : balance;
    amount  = typeof amount == 'string' ? parseFloat(amount) : amount;
    if (type == 'credit') {
        return balance + amount;
    } else if (type == 'debit') {
        return balance - amount;
    } /*else if (type == 'set') {

    }*/
    return amount;
}

let getBalance = (operation, txn, repo) => {
    if (operation != 'remove' && txn.type == 'set') {
        return new Promise((resolve,reject) => {
            resolve(txn.balance);
        });
    }
    return repo.selectTop(1, {when: {$lt: new Date(txn.when)}}, {sort: {when: -1}})
    .then((data) => {
        let prevtxn = (data || [{}])[0];
        return prevtxn.balance || txn.balance;
    });
}

module.exports = (operation, transaction, user) => {
    log.debug('Post process ' + operation + ' for ' + user.username);
    let balance = transaction.balance;
    let transrepo = Repository('transactions', user.username);
    return getBalance(operation, transaction, transrepo)
    .then((value) => {
        balance = value;
        log.trace('running balance = ' + balance);
        return transrepo.selectStream({when: {$gte: new Date(transaction.when)}}, {sort: {when: 1}});
    })
    .then((str) => {
        let stream = str.stream;
        let coll = str.collection;
        let i = 0;
        return new Promise((resolve,reject) => {
            stream.on('data', (doc) => {
                if (operation != 'remove' && transaction.type == 'set'&& i++ == 0) {
                    balance = doc.amount;
                    doc.balance = balance;
                } else {
                    balance = adjust(balance, doc.type, doc.amount);
                    doc.balance = balance;
                }
                log.trace('Update transaction ' + doc.transactionid + ' balance = ' + doc.balance);
                coll.update({_id: doc._id}, {$set: {balance: doc.balance}}, (err,result) => {
                    if (err) {
                        return reject(err);
                    }
                });
            });
            stream.on('end', () => {
                return resolve();
            });
        });
    })
    .then(() => {
        log.trace('Update account ' + transaction.accountid + ' balance = ' + balance);
        let acctrepo = Repository('accounts', user.username);
        return acctrepo.update({accountid: transaction.accountid}, {$set: {balance}});
    })
    .then(() => {
        return transrepo.select({transctionid: transaction.transactionid});
    });
};
