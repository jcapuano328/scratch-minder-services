'use strict'
var CrudServices = require('../lib/crud-services'),
    log = require('../lib/log');

let opts = {
    collection: 'accounts',
    collectionid: 'accountid',
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
    }
};

module.exports = CrudServices(opts);
