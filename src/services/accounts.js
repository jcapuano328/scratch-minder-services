'use strict'
var Repository = require('../lib/repository'),
    log = require('../lib/log');

module.exports = {
    create(params, account) {
        log.info('Create account');
        return new Promise((resolve,reject) => {
            if (!params || !params.userid) {
                return reject({type: 'validation', message: 'User id missing'});
            }
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
        })
        .then((valid) => {
            log.debug('retrieve user');
            let users = Repository('users');
            return users.select({userid: params.userid})
            .then((data) => {
                if (!data || data.length < 1) {
                    throw {type: 'process', message: 'User not found'};
                }
                let user = data[0];
                log.debug('user found: ' + user.username);
                let accounts = Repository('accounts', user.username);
                return accounts.insert(account);
            })
            .then((data) => {
                log.debug('Account created');
                return data;
            })
            .catch((err) => {
                log.error({type: 'process', message: err.message});
                throw err;
            });
        })
        .catch((err) => {
            log.error(err);
            throw err;
        });
    }/*,
    read(params) {
        log.info('Read account');
        return new Promise((resolve,reject) => {
            if (!params || !params.userid) {
                return reject(new Error('User id missing'));
            }
            if (!params || !params.id) {
                return reject(new Error('Account id missing'));
            }
            resolve(true);
        })
        .then((valid) => {
            log.debug(params.userid + ':' + params.id);
            log.debug('retrieve user');
            let users = Repository('users');
            return users.select({userid: params.userid})
            .then((data) => {
                if (!data || data.length < 1) {
                    throw new Error('User not found');
                }
                let user = data[0];
                log.debug('user found: ' + user.username);
                let accounts = Repository('accounts', user.username);
                return accounts.select({accountid: params.id});
            })
            .then((data) => {
                if (!data || data.length < 1) {
                    throw new Error('Account not found');
                }
                let account = data[0];
                log.debug('Account found: ' + account.name + '/' + account.number);
                res.send(200, account);
            })
            .catch((err) => {
                log.error(err);
                res.send(500, err);
            });
        })
        .catch((err) => {
            log.error(err);
            res.send(400, err);
        });
    },
    readAll(params){
        log.info('Read accounts');
        return new Promise((resolve,reject) => {
            if (!params || !params.userid) {
                return reject(new Error('User id missing'));
            }
            resolve(true);
        })
        .then((valid) => {
            log.debug(params.userid);
            log.debug('retrieve user');
            let users = Repository('users');
            return users.select({userid: params.userid})
            .then((data) => {
                if (!data || data.length < 1) {
                    throw new Error('User not found');
                }
                let user = data[0];
                log.debug('user found: ' + user.username);
                let accounts = Repository('accounts', user.username);
                return accounts.select({});
            })
            .then((data) => {
                data = data || [];
                log.debug(data.length + ' Accounts found');
                res.send(200, data);
            })
            .catch((err) => {
                log.error(err);
                res.send(500, err);
            });
        })
        .catch((err) => {
            log.error(err);
            res.send(400, err);
        });
    },
    update(params, account) {
        log.info('Update account');
        return new Promise((resolve,reject) => {
            if (!params || !params.userid) {
                return reject(new Error('User id missing'));
            }
            if (!account) {
                return reject(new Error('Account missing'));
            }
            if (!account.accountid) {
                return reject(new Error('Account id invalid'));
            }
            if (!account.number) {
                return reject(new Error('Account number invalid'));
            }
            if (!account.name) {
                return reject(new Error('Account name invalid'));
            }
            resolve(true);
        })
        .then((valid) => {
            log.debug('retrieve user');
            let users = Repository('users');
            return users.select({userid: params.userid})
            .then((data) => {
                if (!data || data.length < 1) {
                    throw new Error('User not found');
                }
                let user = data[0];
                log.debug('user found: ' + user.username);
                let accounts = Repository('accounts', user.username);
                return accounts.save(account);
            })
            .then((data) => {
                log.debug('Account created');
                res.send(201, data);
            })
            .catch((err) => {
                log.error(err);
                res.send(500, err);
            });
        })
        .catch((err) => {
            log.error(err);
            res.send(400, err);
        });
    },
    remove(params) => {
        log.info('Delete account');
        return new Promise((resolve,reject) => {
            if (!params || !params.userid) {
                return reject(new Error('User id missing'));
            }
            if (!params || !params.id) {
                return reject(new Error('Account id missing'));
            }
            resolve(true);
        })
        .then((valid) => {
            log.debug(params.userid + ':' + params.id);
            log.debug('retrieve user');
            let users = Repository('users');
            return users.select({userid: params.userid})
            .then((data) => {
                if (!data || data.length < 1) {
                    throw new Error('User not found');
                }
                let user = data[0];
                log.debug('user found: ' + user.username);
                let accounts = Repository('accounts', user.username);
                return accounts.remove({accountid: params.id});
            })
            .then((data) => {
                log.debug('Account removed');
                res.send(200, {accountid: params.id});
            })
            .catch((err) => {
                log.error(err);
                res.send(500, err);
            });
        })
        .catch((err) => {
            log.error(err);
            res.send(400, err);
        });
    },
    removeAll(params) {
        log.info('Delete accounts');
        return new Promise((resolve,reject) => {
            if (!params || !params.userid) {
                return reject(new Error('User id missing'));
            }
            resolve(true);
        })
        .then((valid) => {
            log.debug(params.userid);
            log.debug('retrieve user');
            let users = Repository('users');
            return users.select({userid: params.userid})
            .then((data) => {
                if (!data || data.length < 1) {
                    throw new Error('User not found');
                }
                let user = data[0];
                log.debug('user found: ' + user.username);
                let accounts = Repository('accounts', user.username);
                return accounts.remove({});
            })
            .then((data) => {
                log.debug('Accounts removed');
                res.send(200);
            })
            .catch((err) => {
                log.error(err);
                res.send(500, err);
            });
        })
        .catch((err) => {
            log.error(err);
            res.send(400, err);
        });
    }
    */
};
