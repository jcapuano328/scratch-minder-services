'use strict'
var easyPbkdf2 = require('easy-pbkdf2')(),
    users = require('../lib/repository')('users'),
    log = require('../lib/log');

module.exports = [
    {
        method: 'post',
        uri: '/login',
        protected: false,
        handler: (req,res,next) => {
            log.info('Authenticate user');
            let username = req.body.username;
            let password = req.body.password;
            log.trace(username + '/' + password);
            return users.select({username: username})
            .then((data) => {
                let user = data && data.length > 0 ? data[0] : null;
                if (!user) {
                    throw new Error('User not found');
                }
                if (user.status.toLowerCase() === 'locked') {
                    throw new Error('Account is locked');
                }
                if (user.status.toLowerCase() === 'inactive') {
                    throw new Error('Account is inactive');
                }

                log.debug('user found, verify password');
                return new Promise((resolve,reject) => {
                    easyPbkdf2.verify(user.password.salt, user.password.hash, password, function( err, valid ) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(valid);
                    });
                });
            })
            .then((valid) => {
                if (!valid) {
                    throw new Error('Invalid Username/Password');
                }
                log.debug('User ' + username + ' authenticated');
                res.send(200);
            })
            .catch((err) => {
                log.error(err);
                res.send(401, err);
            });
        }
    }
];
