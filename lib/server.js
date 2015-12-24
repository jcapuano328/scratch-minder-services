'use strict'
var config = require('config'),
    restify = require('restify'),
    router = require('./router'),
    log = require('./log');

var server;

module.exports = {
    start() {
        log.info('Start Server on port ' + config.port);
        return new Promise((resolve, reject) => {
            server = restify.createServer();
            server.use(restify.gzipResponse());
            server.use(restify.queryParser());
            server.use(restify.bodyParser());
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
