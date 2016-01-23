'use strict'
var Repository = require('../lib/repository'),
    log = require('../lib/log');

/* opts
        collection: collection name
        collectionid: collection id field name
        user:       true/false
        validators:
            create:
                params:
                data:
            read:
                params:
            readAll:
                params:
            update:
                params:
                data:
            remove:
                params:
            removeAll:
                params:
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
    opts.validators.update = opts.validators.update || validateTrue;
    opts.validators.remove = opts.validators.remove || validateTrue;
    opts.validators.removeAll = opts.validators.removeAll || validateTrue;

    return {
        create(params, data) {
            log.info('Create ' + opts.collection);
            return validateUser(opts.user, params)
            .then((valid) => {
                return opts.validators.create(params, data);
            })
            .then((valid) => {
                return retrieveUser(params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                return repo.insert(data);
            })
            .then((result) => {
                log.debug(opts.collection + ' created');
                return result;
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
                return retrieveUser(params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                let query = {};
                query[opts.collectionid] = params.id;
                return repo.select(query, opts.options);
            })
            .then((result) => {
                if (!result || result.length < 1) {
                    throw {type: 'process', message: opts.collection + ' not found'};
                }
                let d = result[0];
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
                return retrieveUser(params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                return repo.select({}, opts.options);
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
                return retrieveUser(params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                return repo.save(data);
            })
            .then((result) => {
                log.debug(opts.collection + ' updated');
                return result;
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
                return retrieveUser(params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                let query = {};
                query[opts.collectionid] = params.id;
                return repo.remove(query);
            })
            .then((result) => {
                log.debug(opts.collection + ' removed');
                return result;
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
                return retrieveUser(params.userid);
            })
            .then((user) => {
                let repo = Repository(opts.collection, user.username);
                return repo.remove({});
            })
            .then((result) => {
                log.debug(opts.collection + ' removed');
                return result;
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

let retrieveUser = (userid) => {
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
