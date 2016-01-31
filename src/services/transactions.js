'use strict'
var CrudServices = require('../lib/crud-services'),
    _ = require('lodash'),
    log = require('../lib/log');
var validTransactionType = (type) => {
    return (['credit','debit','set'].indexOf(type) >= 0);
}

var checkTypes = (transaction) => {
    if (!transaction.hasOwnProperty('amount')) {
        transaction.amount = 0;
    }
    else if (!_.isNumber(transaction.amount)) {
        transaction.amount = parseFloat(transaction.amount);
    }

    if (!transaction.hasOwnProperty('balance')) {
        transaction.balance = 0;
    }
    else if (!_.isNumber(transaction.balance)) {
        transaction.balance = parseFloat(transaction.balance);
    }

    if (!transaction.when) {
        transaction.when = new Date();
    }
    else if (!_.isDate(transaction.when)) {
        transaction.when = new Date(transaction.when);
    }
}

let opts = {
    collection: 'transactions',
    collectionid: 'transactionid',
    options: {
        sort: {
            when: -1
        }
    },
    user: true,
    validators: {
        create(params, transaction) {
            log.debug('Validate create transaction');
            return new Promise((resolve,reject) => {
                if (!transaction) {
                    return reject({type: 'validation', message: 'Transaction missing'});
                }
                if (!transaction.type || !validTransactionType(transaction.type)) {
                    return reject({type: 'validation', message: 'Transaction type invalid'});
                }
                if (!transaction.sequence) {
                    return reject({type: 'validation', message: 'Transaction sequence invalid'});
                }
                if (!transaction.description) {
                    return reject({type: 'validation', message: 'Transaction description invalid'});
                }

                checkTypes(transaction);

                resolve(true);
            });
        },
        read(params) {
            log.debug('Validate read transaction');
            return new Promise((resolve,reject) => {
                if (!params || !params.id) {
                    return reject({type: 'validation', message: 'Transaction id missing'});
                }
                resolve(true);
            });
        },
        readAll() {
            log.debug('Validate read all transactions');
            return Promise.accept(true);
        },
        update(params, transaction) {
            log.debug('Validate update transaction');
            return new Promise((resolve,reject) => {
                if (!transaction) {
                    return reject({type: 'validation', message: 'Transaction missing'});
                }
                if (!transaction.transactionid) {
                    return reject({type: 'validation', message: 'Transaction id invalid'});
                }
                if (!transaction.type || !validTransactionType(transaction.type)) {
                    return reject({type: 'validation', message: 'Transaction type invalid'});
                }
                if (!transaction.sequence) {
                    return reject({type: 'validation', message: 'Transaction sequence invalid'});
                }
                if (!transaction.description) {
                    return reject({type: 'validation', message: 'Transaction description invalid'});
                }

                checkTypes(transaction);

                resolve(true);
            });
        },
        remove(params) {
            log.debug('Validate remove transaction');
            return new Promise((resolve,reject) => {
                if (!params.id) {
                    return reject({type: 'validation', message: 'Transaction id missing'});
                }
                resolve(true);
            });
        },
        removeAll() {
            log.debug('Validate remove all transactions');
            return Promise.accept(true);
        }
    }
};

module.exports = CrudServices(opts);
