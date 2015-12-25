'use strict'
var config = require('config'),
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
    var routes = require(file) || [];
    routes.forEach((route) => {
        log.debug('Register route ' + JSON.stringify(route));
        if (route.method == 'delete') { route.method = 'del'; }
        if (methods.indexOf(route.method) < 0) {
            throw new Exception(route.method + ' is not a valid HTTP method');
        }
        server[route.method](route.url, route.handler);
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
