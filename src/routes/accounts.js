'use strict'
var Repository = require('../lib/repository'),
    log = require('../lib/log');

module.exports = [
    {
        method: 'post',
        uri: '/user/:userid/accounts',
        protected: true,
        handler: (req,res,next) => {
            log.info('Create account');
            return new Promise((resolve,reject) => {
                if (!req.params || !req.params.userid) {
                    return reject(new Error('User id missing'));
                }
                if (!req.body) {
                    return reject(new Error('Account missing'));
                }
                if (!req.body.accountid) {
                    return reject(new Error('Account id invalid'));
                }
                if (!req.body.number) {
                    return reject(new Error('Account number invalid'));
                }
                if (!req.body.name) {
                    return reject(new Error('Account name invalid'));
                }
                resolve(true);
            })
            .then((valid) => {
                log.debug('retrieve user');
                let users = Repository('users');
                return users.select({userid: req.params.userid})
                .then((data) => {
                    if (!data || data.length < 1) {
                        throw new Error('User not found');
                    }
                    let user = data[0];
                    log.debug('user found: ' + user.username);
                    let accounts = Repository('accounts', user.username);
                    return accounts.insert(req.body);
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
        }
    },
    {
        method: 'get',
        uri: '/user/:userid/accounts/:id',
        protected: true,
        handler: (req,res,next) => {
            log.info('Read account');
            return new Promise((resolve,reject) => {
                if (!req.params || !req.params.userid) {
                    return reject(new Error('User id missing'));
                }
                if (!req.params || !req.params.id) {
                    return reject(new Error('Account id missing'));
                }
                resolve(true);
            })
            .then((valid) => {
                log.debug(req.params.userid + ':' + req.params.id);
                log.debug('retrieve user');
                let users = Repository('users');
                return users.select({userid: req.params.userid})
                .then((data) => {
                    if (!data || data.length < 1) {
                        throw new Error('User not found');
                    }
                    let user = data[0];
                    log.debug('user found: ' + user.username);
                    let accounts = Repository('accounts', user.username);
                    return accounts.select({accountid: req.params.id});
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
        }
    },
    {
        method: 'get',
        uri: '/user/:userid/accounts',
        protected: true,
        handler: (req,res,next) => {
            log.info('Read accounts');
            return new Promise((resolve,reject) => {
                if (!req.params || !req.params.userid) {
                    return reject(new Error('User id missing'));
                }
                resolve(true);
            })
            .then((valid) => {
                log.debug(req.params.userid + ':' + req.params.id);
                log.debug('retrieve user');
                let users = Repository('users');
                return users.select({userid: req.params.userid})
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
        }
    },
    {
        method: 'put',
        uri: '/user/:userid/accounts/:id',
        protected: true,
        handler: (req,res,next) => {
            log.info('Update account');
            return new Promise((resolve,reject) => {
                if (!req.params || !req.params.userid) {
                    return reject(new Error('User id missing'));
                }
                if (!req.body) {
                    return reject(new Error('Account missing'));
                }
                if (!req.body.accountid) {
                    return reject(new Error('Account id invalid'));
                }
                if (!req.body.number) {
                    return reject(new Error('Account number invalid'));
                }
                if (!req.body.name) {
                    return reject(new Error('Account name invalid'));
                }
                resolve(true);
            })
            .then((valid) => {
                log.debug('retrieve user');
                let users = Repository('users');
                return users.select({userid: req.params.userid})
                .then((data) => {
                    if (!data || data.length < 1) {
                        throw new Error('User not found');
                    }
                    let user = data[0];
                    log.debug('user found: ' + user.username);
                    let accounts = Repository('accounts', user.username);
                    return accounts.save(req.body);
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
        }
    },
    {
        method: 'del',
        uri: '/user/:userid/accounts/:id',
        protected: true,
        handler: (req,res,next) => {
            log.info('Delete account');
            return new Promise((resolve,reject) => {
                if (!req.params || !req.params.userid) {
                    return reject(new Error('User id missing'));
                }
                if (!req.params || !req.params.id) {
                    return reject(new Error('Account id missing'));
                }
                resolve(true);
            })
            .then((valid) => {
                log.debug(req.params.userid + ':' + req.params.id);
                log.debug('retrieve user');
                let users = Repository('users');
                return users.select({userid: req.params.userid})
                .then((data) => {
                    if (!data || data.length < 1) {
                        throw new Error('User not found');
                    }
                    let user = data[0];
                    log.debug('user found: ' + user.username);
                    let accounts = Repository('accounts', user.username);
                    return accounts.remove({accountid: req.params.id});
                })
                .then((data) => {
                    log.debug('Account removed');
                    res.send(200, {accountid: req.params.id});
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
    },
    {
        method: 'del',
        uri: '/user/:userid/accounts',
        protected: true,
        handler: (req,res,next) => {
            log.info('Delete accounts');
            return new Promise((resolve,reject) => {
                if (!req.params || !req.params.userid) {
                    return reject(new Error('User id missing'));
                }
                resolve(true);
            })
            .then((valid) => {
                log.debug(req.params.userid + ':' + req.params.id);
                log.debug('retrieve user');
                let users = Repository('users');
                return users.select({userid: req.params.userid})
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
    }
];
