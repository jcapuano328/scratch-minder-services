'use strict'
var Repository = require('../lib/repository'),
    log = require('../lib/log');

/* opts
        collection: collection name
        collectionid: collection id field name
        options:
                    mongo options: sort, etc
        user:       true/false
        validators:
            create:
                params:
                data:
            read:
                params:
            readAll:
                params:
            search:
                params
            update:
                params:
                data:
            remove:
                params:
            removeAll:
                params:
        search
            params
        createNew
            params:
            data:
        newOptions
        preProcess
            operation:
            data:
            user:
        postProcess
            operation:
            data:
            user:
 */
let crudServices = (opts) => {
    opts = opts || {
        collection: '',
        collectionid: '',
        user: true,
        validators: {}
    };
    opts.validators = opts.validators || {};
    opts.validators.create = opts.validators.create || validateTrue;
    opts.validators.read = opts.validators.read || validateTrue;
    opts.validators.readAll = opts.validators.readAll || validateTrue;
    opts.validators.search = opts.validators.search || validateTrue;
    opts.validators.update = opts.validators.update || validateTrue;
    opts.validators.remove = opts.validators.remove || validateTrue;
    opts.validators.removeAll = opts.validators.removeAll || validateTrue;
    opts.search = opts.search || (() => {return {};});
    opts.createNew = opts.createNew || ((params, d) => {return d;});
    opts.preProcess = opts.preProcess || ((o,d,u) => { return Promise.accept(d); });
    opts.postProcess = opts.postProcess || ((o,d,u) => { return Promise.accept(d); });

    return {
        create(params, data) {
            log.info('Create ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.create(params, data);
            })
            .then((valid) => {
                return retrieveUser(opts.user, params.userid);
            })
            .then((user) => {
                return opts.preProcess('create', data, user)
                .then((d) => {
                    let repo = Repository(opts.collection, user.username);
                    return repo.insert(d);
                })
                .then((result) => {
                    log.debug(opts.collection + ' created');
                    return opts.postProcess('create', data, user)
                    .then((d) => {
                        return d || result;
                    });
                });
            })
            .catch((err) => {
                log.error(err.message);
                throw err;
            });
        },

        read(params) {
            log.info('Read ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.read(params);
            })
            .then((valid) => {
                return retrieveUser(opts.user, params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                let query = {};
                let options = opts.options;
                if (params.id == 'new' && opts.newOptions) {
                    options = opts.newOptions();
                }
                else {
                    query[opts.collectionid] = params.id;
                }
                return repo.select(query, options)
            })
            .then((result) => {
                let d = (result && result.length > 0) ? result[0] : null;
                if (params.id != 'new' && !d) {
                    throw {type: 'process', message: opts.collection + ' not found'};
                }
                if (params.id == 'new') {
                    d = opts.createNew(params, d);
                }
                log.debug(opts.collection + ' found: ' + JSON.stringify(d));
                return d;
            })
            .catch((err) => {
                log.error(err.message);
                throw err;
            });
        },

        readAll(params) {
            log.info('Read ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.readAll(params);
            })
            .then((valid) => {
                return retrieveUser(opts.user, params.userid);
            })
            .then((user) => {
                let query = opts.search(params) || {};
                let repo = Repository(opts.collection, user.username);
                return repo.select(query, opts.options);
            })
            .then((result) => {
                result = result || [];
                log.debug(result.length + ' ' + opts.collection + ' found');
                return result;
            })
            .catch((err) => {
                log.error(err.message);
                throw err;
            });
        },

        search(params) {
            log.info('Search ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.search(params);
            })
            .then((valid) => {
                return retrieveUser(opts.user, params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                let query = opts.search(params);
                return repo.select(query, opts.options);
            })
            .then((result) => {
                result = result || [];
                log.debug(result.length + ' ' + opts.collection + ' found');
                return result;
            })
            .catch((err) => {
                log.error(err.message);
                throw err;
            });
        },

        update(params, data) {
            log.info('Update ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.update(params, data);
            })
            .then((valid) => {
                return retrieveUser(opts.user, params.userid);
            })
            .then((user) => {
                return opts.preProcess('update', data, user)
                .then((d) => {
                    let repo = Repository(opts.collection, user.username);
                    return repo.save(d);
                })
                .then((result) => {
                    log.debug(opts.collection + ' updated');
                    return opts.postProcess('update', data, user)
                    .then((d) => {
                        return d || result;
                    });
                });
            })
            .catch((err) => {
                log.error(err.message);
                throw err;
            });
        },

        remove(params) {
            log.info('Remove ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.remove(params);
            })
            .then((valid) => {
                return retrieveUser(opts.user, params.userid);
            })
            .then((user) => {
                return opts.preProcess('remove', {}, user)
                .then((d) => {
                    let repo = Repository(opts.collection, user.username);
                    let query = {};
                    query[opts.collectionid] = params.id;
                    return repo.remove(query);
                })
                .then((result) => {
                    log.debug(opts.collection + ' removed');
                    return opts.postProcess('remove', result, user)
                    .then((d) => {
                        return d || result;
                    });
                });
            })
            .catch((err) => {
                log.error(err.message);
                throw err;
            });
        },
        removeAll(params) {
            log.info('Remove ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.removeAll(params);
            })
            .then((valid) => {
                return retrieveUser(opts.user, params.userid);
            })
            .then((user) => {
                return opts.preProcess('remove', {}, user)
                .then((d) => {
                    let repo = Repository(opts.collection, user.username);
                    return repo.remove({});
                })
                .then((result) => {
                    log.debug(opts.collection + ' removed');
                    return opts.postProcess('remove', result, user)
                    .then((d) => {
                        return d || result;
                    });
                });
            })
            .catch((err) => {
                log.error(err.message);
                throw err;
            });
        }
    };
};

let validateUser = (includeuser, params) => {
    return new Promise((resolve,reject) => {
        if (includeuser && (!params || !params.userid)) {
            return reject({type: 'validation', message: 'User id missing'});
        }
        resolve(true);
    });
}

let validateTrue = () => { return Promise.accept(true); };

let retrieveUser = (includeuser, userid) => {
    if (!includeuser) {
        return Promise.accept({});
    }
    log.debug(userid);
    log.debug('retrieve user');
    let users = Repository('users');
    return users.select({userid: userid})
    .then((data) => {
        if (!data || data.length < 1) {
            throw {type: 'process', message: 'User not found'};
        }
        let user = data[0];
        log.debug('user found: ' + user.username);
        return user;
    });
}

module.exports = crudServices;
