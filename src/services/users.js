'use strict'
var CrudServices = require('../lib/crud-services'),
    Repository = require('../lib/repository'),
    uuid = require('node-uuid'),
    log = require('../lib/log');

let opts = {
    collection: 'users',
    collectionid: 'userid',
    options: {
        sort: {
            username: 1
        }
    },
    user: false,
    validators: {
        create(params, user) {
            log.debug('Validate create user');
            return new Promise((resolve,reject) => {
                if (!params || !params.id) {
                    return reject({type: 'validation', message: 'user id missing'});
                }
                if (!user) {
                    return reject({type: 'validation', message: 'user missing'});
                }
                if (!user.userid) {
                    return reject({type: 'validation', message: 'user id invalid'});
                }
                if (!user.username) {
                    return reject({type: 'validation', message: 'user username invalid'});
                }
                resolve(true);
            });
        },
        read(params) {
            log.debug('Validate read user');
            return new Promise((resolve,reject) => {
                if (!params || !params.id) {
                    return reject({type: 'validation', message: 'user id missing'});
                }
                resolve(true);
            });
        },
        readAll() {
            log.debug('Validate read all users');
            return Promise.accept(true);
        },
        update(params, user) {
            log.debug('Validate update user');
            return new Promise((resolve,reject) => {
                if (!params || !params.id) {
                    return reject({type: 'validation', message: 'user id missing'});
                }
                if (!user) {
                    return reject({type: 'validation', message: 'user missing'});
                }
                if (!user.userid) {
                    return reject({type: 'validation', message: 'user id invalid'});
                }
                if (!user.username) {
                    return reject({type: 'validation', message: 'user username invalid'});
                }
                resolve(true);
            });
        },
        remove(params) {
            log.debug('Validate remove user');
            return new Promise((resolve,reject) => {
                if (!params || !params.id) {
                    return reject({type: 'validation', message: 'user id missing'});
                }
                resolve(true);
            });
        },
        removeAll() {
            log.debug('Validate remove all users');
            return Promise.accept(true);
        }
    },
    createNew(params, d) {
        return {
            userid: uuid.v1(),
            email: '',
            firstname: '',
            lastname: '',
            username: '',
            status: 'active',
            roles: {},
            password: {},
            preferredAccount: null
        };
    }
};

module.exports = CrudServices(opts);
