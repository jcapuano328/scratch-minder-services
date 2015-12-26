'use strict'
var config = require('config'),
    restify = require('restify'),
    oauthserver = require('oauth2-server-restify'),
    router = require('./router'),
    log = require('../lib/log');

var server;

module.exports = {
    start() {
        log.info('Start Server on port ' + config.port);
        return new Promise((resolve, reject) => {
            server = restify.createServer();
            server.use(restify.gzipResponse());
            server.use(restify.queryParser());
            server.use(restify.bodyParser({mapParams: false}));
            server.oauth = oauthserver({
              model: require('../oauth/model'),
              grants: ['password', 'refresh_token'],
              debug: log.error
            });
            log.trace('load routes');
            router.register(server)
            .then(() => {
                log.trace('routes loaded');
                server.listen(config.port, () => {
                    log.info('Listening on port ' + config.port);
                    resolve();
                });
            })
            .catch((err) => {
                log.error(err);
                reject(err);
            });
        });
    },

    stop() {
        return new Promise((resolve, reject) => {
            log.info('Stopping Server');
            if (!server) {
                return reject(new Error('Server has not started!'));
            }
            server.close(() => {
                log.info('Stopped Server');
                resolve();
            });
        });
    }
};
