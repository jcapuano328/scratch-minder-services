'use strict'
var CrudServices = require('../lib/crud-services'),
    Repository = require('../lib/repository'),
    uuid = require('node-uuid'),
    log = require('../lib/log');

let opts = {
    collection: 'accounts',
    collectionid: 'accountid',
    options: {
        sort: {
            name: 1
        }
    },
    user: true,
    validators: {
        create(params, account) {
            log.debug('Validate create account');
            return new Promise((resolve,reject) => {
                if (!account) {
                    return reject({type: 'validation', message: 'Account missing'});
                }
                if (!account.accountid) {
                    return reject({type: 'validation', message: 'Account id invalid'});
                }
                if (!account.number) {
                    return reject({type: 'validation', message: 'Account number invalid'});
                }
                if (!account.name) {
                    return reject({type: 'validation', message: 'Account name invalid'});
                }
                resolve(true);
            });
        },
        read(params) {
            log.debug('Validate read account');
            return new Promise((resolve,reject) => {
                if (!params || !params.id) {
                    return reject({type: 'validation', message: 'Account id missing'});
                }
                resolve(true);
            });
        },
        readAll() {
            log.debug('Validate read all accounts');
            return Promise.accept(true);
        },
        update(params, account) {
            log.debug('Validate update account');
            return new Promise((resolve,reject) => {
                if (!account) {
                    return reject({type: 'validation', message: 'Account missing'});
                }
                if (!account.accountid) {
                    return reject({type: 'validation', message: 'Account id invalid'});
                }
                if (!account.number) {
                    return reject({type: 'validation', message: 'Account number invalid'});
                }
                if (!account.name) {
                    return reject({type: 'validation', message: 'Account name invalid'});
                }
                resolve(true);
            });
        },
        remove(params) {
            log.debug('Validate remove account');
            return new Promise((resolve,reject) => {
                if (!params.id) {
                    return reject({type: 'validation', message: 'Account id missing'});
                }
                resolve(true);
            });
        },
        removeAll() {
            log.debug('Validate remove all accounts');
            return Promise.accept(true);
        }
    },
    createNew(params, d) {        
        return {
            accountid: uuid.v1(),
            name: '',
            number: '',
            sequence: '',
            balance: 0
        };
    },
    postProcess(operation, account, user) {
        if (operation == 'create') {
            let repo = Repository('transactions', user.username);
            let txn = {
                "transactionid": uuid.v1(),
                "accountid": account.accountid,
                "type": "set",
                "sequence": "",
                "category": "Balance",
                "description": "Opening balance",
                "amount": account.balance,
                "when": new Date(),
                "balance": account.balance
            };
            return repo.insert(txn)
            .then((data) => {
                return account;
            });
        }
        else if (operation == 'remove') {
            // remove all transactions
            let repo = Repository('transactions', user.username);
            return repo.remove({accountid: account.accountid});
        }
        return Promise.accept(account);
    }

};

module.exports = CrudServices(opts);
