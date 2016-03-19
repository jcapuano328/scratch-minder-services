'use strict'
var CrudServices = require('../lib/crud-services'),
    Repository = require('../lib/repository'),
    uuid = require('node-uuid'),
    passwordSvc = require('../lib/password'),
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
            preferredAccount: null,
            homeView: 'summary'
        };
    },
    createDoc(d) {
        return {
            userid: d.userid,
            username: d.username,
            firstname: d.firstname,
            lastname: d.lastname,
            email: d.email,
            roles: d.roles,
            homeView: d.homeView,
            preferredAccount: d.preferredAccount
        };
    }
};

var services = CrudServices(opts);


services.resetPassword = (params, data) => {
    let repo = Repository('users');
    log.debug('Reset user password');
    return new Promise((resolve,reject) => {
        if (!params || !params.id) {
            return reject({type: 'validation', message: 'user id missing'});
        }
        if (!data || !data.currentpwd) {
            return reject({type: 'validation', message: 'current password missing'});
        }
        if (!data || !data.newpwd) {
            return reject({type: 'validation', message: 'new password missing'});
        }
        if (!data || !data.confirmpwd) {
            return reject({type: 'validation', message: 'confirm password missing'});
        }
        if (data.newpwd !== data.confirmpwd) {
            return reject({type: 'validation', message: 'new password does not match confirm password'});
        }
        resolve();
    })
    .then(() => {
        log.debug('Retrieve user ' + params.id);
        return repo.select({userid: params.id});
    })
    .then((users) => {
        let user = users && users.length > 0 ? users[0] : null;
        if (!user) {
            throw {type: 'process', message: 'user not found'};
        }
        log.debug('Verify current password for ' + user.username);
        return passwordSvc.verify(data.currentpwd, user.password.salt, user.password.hash)
        .then((valid) => {
            if (!valid) {
                throw {type: 'process', message: 'current password invalid'};
            }
            log.debug('Generate hash for new password for ' + user.username);
            return passwordSvc.generate(data.newpwd);
        })
        .then((result) => {
            log.debug('Save hash for new password for ' + user.username);
            user.password = result;
            return repo.save(user);
        })
        .then((usr) => {
            return usr;
        });
    });
}

module.exports = services;
