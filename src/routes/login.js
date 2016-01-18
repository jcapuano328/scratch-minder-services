'use strict'
var login = require('../services/login'),
    log = require('../lib/log'),
    _ = require('lodash');

module.exports = [
    {
        method: 'post',
        uri: '/login',
        protected: false,
        handler: (req,res,next) => {
            log.info('Received login request');
            log.trace(JSON.stringify(req.body));
            return new Promise((resolve,reject) => {
                if (!req || !req.body) {
                    return reject('Invalid request body');
                }
                return resolve();
            })
            .then(() => {
                return login.login(req.body.username, req.body.password)
            })
            .then((user) => {
                log.info('Login request successful');
                let usr = _.pick(user, 'userid', 'username', 'firstname', 'lastname', 'email', 'roles', 'preferredAccount');
                log.trace(JSON.stringify(usr));
                res.send(200, usr);
            })
            .catch((err) => {
                log.error(err);
                let code = err.type === 'process' ? 401 : 500;
                res.send(code, err);
            });
        }
    }
];
