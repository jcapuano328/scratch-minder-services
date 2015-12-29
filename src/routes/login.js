'use strict'
var login = require('../services/login'),
    log = require('../lib/log');

module.exports = [
    {
        method: 'post',
        uri: '/login',
        protected: false,
        handler: (req,res,next) => {
            return login.login(req.body.username, req.body.password)
            .then((user) => {
                res.send(200, user);
            })
            .catch((err) => {
                log.error(err);
                let code = err.type === 'process' ? 401 : 500;
                res.send(code, err);
            });
        }
    }
];
