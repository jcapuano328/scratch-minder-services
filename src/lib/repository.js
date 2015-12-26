'use strict';
var config = require('config'),
    log = require('../lib/log'),
    connectionpool = require('../lib/connection-pool'),
    mongo = require('mongodb');

function connectionString(databasename) {
    databasename = databasename || config.db.name;
    let connstr = 'mongodb://';
    if (config.db.username) {
        connstr += config.db.username + ':' + config.db.password + '@';
    }
    connstr += config.db.server + ':' + config.db.port + '/' + databasename;
    return connstr;
}

module.exports = (collectionname, databasename) => {
    return {
        connect() {
            var connstr = connectionString(databasename);
            log.trace('Connecting to ' + connstr);
            return connectionpool.connect(connstr);
        },
        disconnect() {
            log.trace('Disconnecting');
            return connectionpool.disconnect();
        },
        select(query, options) {
            query = query || {};
            options = options || {};
            return this.connect()
            .then((db) => {
                log.trace('Select ' + JSON.stringify(query) + ' from ' + collectionname);
                var collection = db.collection(collectionname);
                return new Promise((resolve,reject) => {
                    collection.find(query, options, (err, cursor) => {
                        if (err) {
                            return reject(err);
                        }
                        if (!cursor) {
                            return reject('no cursor');
                        }
                        cursor.toArray((err, data) => {
                            if (err) {
                                return reject(err);
                            }
                            //if (!data) {
                            //    return reject('no data');
                            //}
                            return resolve(data);
                        });
                    });
                });
            });
        },
        insert(data, options) {
            data = data || {};
            options = options || {};
            return this.connect()
            .then((db) => {
                log.trace('Insert ' + JSON.stringify(data));
                var collection = db.collection(collectionname);
                return new Promise((resolve,reject) => {
                    collection.insert(data, options, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(result);
                    });
                });
            });
        },
        update(query, fields, options) {
            query = query || {};
            options = options || {};
            return this.connect()
            .then((db) => {
                log.trace('Update ' + JSON.stringify(query) + ' with ' + JSON.stringify(fields));
                var collection = db.collection(collectionname);
                return new Promise((resolve,reject) => {
                    collection.update(query, fields, options, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(result);
                    });
                });
            });
        },
        remove(query, options) {
            query = query || {};
            options = options || {};
            return this.connect()
            .then((db) => {
                log.trace('Remove ' + JSON.stringify(query));
                var collection = db.collection(collectionname);
                return new Promise((resolve,reject) => {
                    collection.remove(query, options, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(result);
                    });
                });
            });
        },
        save(data, options) {
            options = options || {};
            return this.connect()
            .then((db) => {
                log.trace('Save ' + JSON.stringify(data));
                var collection = db.collection(collectionname);
                return new Promise((resolve,reject) => {
                    collection.save(data, options, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(result);
                    });
                });
            });
        }
    };
};
