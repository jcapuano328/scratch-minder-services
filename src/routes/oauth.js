'use strict'
var oauth = require('../services/oauth2'),
    log = require('../lib/log');

//x-www-form-urlencoded
module.exports = [
    {
        method: 'post',
        uri: '/oauth/token',
        protected: false,
        handler: (req,res,next) => {
            log.info('Process grant request');
            let opts = {
                "grant_type": req.body.grant_type,
                "username": req.body.username,
                "password": req.body.password,
                "client_id": req.body.client_id,
                "client_secret": req.body.client_secret
            };
            log.trace(JSON.stringify(opts));
            return oauth.grant(opts)
            .then((token) => {
                log.trace(JSON.stringify(token));
                res.set('Cache-Control', 'no-store')
                    .set('Pragma', 'no-cache')
                    .send(201, token);
            })
            .catch((err) => {
                log.error(err.message);
                res.send(400, err);
            });
        }
    },
    {
        method: 'post',
        uri: '/oauth/verify',
        protected: false,
        handler: (req,res,next) => {
            log.info('Process verification request');
            let opts = {
                scheme: 'Bearer',
                credentials: req.body.access_token
            };
            log.trace(JSON.stringify(opts));
            return oauth.authorize(opts)
            .then((result) => {
                if (!result) {
                    log.debug('Not Verified');
                    return res.send(401);
                }
                log.debug('Verified');
                res.send(200);
            })
            .catch((err) => {
                log.error(err.message);
                res.send(400, err);
            });
        }
    }

];
