'use strict'
var config = require('config'),
    path = require('path'),
    file = require('file'),
    log = require('../lib/log');

var methods = ['post', 'get', 'put', 'del'];

function findFiles(folder) {
    log.debug('load routes from ' + folder);
    return new Promise((resolve, reject) => {
        file.walk(folder, (err, start, dirs, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files || []);
        });
    });
}

function registerRoutes(file, server) {
    log.trace('Loading routes from ' + file);
    let routes = require(path.resolve(file)) || [];
    if (typeof routes === 'function') {
        routes = routes(server);
    }
    routes.forEach((route) => {
        log.debug('Register route ' + JSON.stringify(route));
        if (route.method == 'delete') { route.method = 'del'; }
        if (methods.indexOf(route.method) < 0) {
            throw new Exception(route.method + ' is not a valid HTTP method');
        }
        let auth = route.protected && server.oauth ? server.oauth.authorise() : (req,res,next) => {return next();};
        server[route.method](route.uri, auth, route.handler);
    });
}

function register(server) {
    log.debug('Register routes');
    return new Promise((resolve, reject) => {
        findFiles(config.paths.routes)
        .then((files) => {
            files.forEach((file) => {
                registerRoutes(file, server);
            });
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    register: register
};
