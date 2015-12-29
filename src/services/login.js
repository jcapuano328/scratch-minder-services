'use strict'
var easyPbkdf2 = require('easy-pbkdf2')(),
    users = require('../lib/repository')('users'),
    log = require('../lib/log');

module.exports = {
    login(username,password) {
        log.info('Authenticate user');
        log.trace(username + '/' + password);
        return users.select({username: username})
        .then((data) => {
            let user = data && data.length > 0 ? data[0] : null;
            if (!user) {
                throw {type: 'process', message: 'User not found'};
            }
            if (user.status.toLowerCase() === 'locked') {
                throw {type: 'process', message: 'Account is locked'};
            }
            if (user.status.toLowerCase() === 'inactive') {
                throw {type: 'process', message: 'Account is inactive'};
            }

            log.debug('user found, verify password');
            return new Promise((resolve,reject) => {
                easyPbkdf2.verify(user.password.salt, user.password.hash, password, function( err, valid ) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(valid);
                });
            })
            .then((valid) => {
                if (!valid) {
                    throw {type: 'process', message: 'Invalid Username/Password'};
                }
                log.debug('User ' + username + ' authenticated');
                return user;
            });
        })
        .catch((err) => {
            log.error(err);
            throw err;
        });
    }
};
