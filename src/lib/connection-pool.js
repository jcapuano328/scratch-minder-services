'use strict';
var mongo = require('mongodb').MongoClient;
var log = require('../lib/log');

var pool = pool || {};

function close(connstr) {
    return new Promise((resolve,reject) => {
        if (!pool.hasOwnProperty(connstr)) {
            log.trace('connection not in pool');
            return resolve(false);
        }
        log.trace('connection in pool');
        pool[connstr].close(true, (err, db) => {
            if (err) {
                return reject(err);
            }
            delete pool[connstr];
            resolve(true);
        });
    });
}

module.exports = {
    connect(connstr) {
        return new Promise((resolve,reject) => {
            if (!connstr) {
                log.error('Connection String missing');
                return reject('Connection String missing');
            }
            if (pool.hasOwnProperty(connstr)) {
                log.trace('connection in pool');
                return resolve(pool[connstr]);
            }
            log.trace('connection not in pool');
            mongo.connect(connstr, (err, db) => {
                if (err) {
                    return reject(err);
                }
                pool[connstr] = db;
                resolve(db);
            });
        });
    },
    disconnect(connstr) {
        return new Promise((resolve,reject) => {
            if (!connstr) {
                log.trace('disconnect all in pool');
                var promises = [];
                Object.keys(pool).forEach((key) => {
                    promises.push(close(key));
                    delete pool[key];
                });
                Promise.all(promises).then(() => {resolve(true)}).catch(reject);
            }
            else {
                close(connstr).then(resolve).catch(reject);
            }
        });
    }
}
