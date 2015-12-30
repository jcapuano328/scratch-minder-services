'use strict'
var easyPbkdf2 = require('easy-pbkdf2')(),
    Repository = require('../lib/repository'),
    genToken = require('../lib/generate-token'),
    log = require('../lib/log');

/*
    grant types:
        password, client_credentials

    grant:
        method to receive grant request, validate, authenticate, and respond with a token

    authorize:
        method to verify token in Bearer Authorization mode
*/

function nowPlusMins(mins) {
    let now = new Date();
    return new Date(now.getTime() + (mins*60000));
}

function generateToken() {
    return genToken()
    .then((token) => {
        return token;
    })
    .catch((err) => {
        return {type: 'process', message: err.toString()};
    });
}

function saveToken(token, clientId, userId, expires) {
    expires = expires || nowPlusMins(30);
    log.trace('in saveToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');
    let repo = Repository('tokens');
    return repo.insert({
        token: token,
        type: 'access',
        clientId: clientId,
        userId: userId,
        expires: expires
    })
    .then(() => {
        log.trace('saved');
        return token;
    });
}

function getUser(query) {
    log.debug('get user ' + JSON.stringify(query));
    let users = Repository('users');
    return users.select(query)
    .then((data) => {
        let user = data && data.length > 0 ? data[0] : null;
        if (!user) {
            throw {type: 'process', message: 'User not found'};
        }
        if (user.status.toLowerCase() === 'locked') {
            throw {type: 'process', message: 'Account is locked'};
        }
        if (user.status.toLowerCase() === 'inactive') {
            throw {type: 'process', message: 'Account is inactive'};
        }
        return user;
    });
}

function passwordGrant(username, password) {
    log.debug('process password grant');
    return getUser({username: username})
    .then((user) => {
        log.debug('user found, verify password');
        return new Promise((resolve,reject) => {
            easyPbkdf2.verify(user.password.salt, user.password.hash, password, function( err, valid ) {
                if (err || !valid) {
                    return reject({type: 'process', message: 'Invalid Credentials specified'});
                }
                resolve(valid);
            });
        })
        .then((valid) => {
            log.debug('generate token');
            return generateToken();
        })
        .then((token) => {
            log.debug('save token');
            return saveToken(token, null, user.userid);
        })
        .then((token) => {
            return {
                token_type: 'bearer',
                access_token: token
            };
        });
    })
    .catch((err) => {
        if (!err.hasOwnProperty('type')) {
            err = {type: 'process', message: JSON.stringify(err)};
        }
        throw err;
    });
}

module.exports = {
    grant(opts) {
        opts = opts || {};
        log.debug('process grant request');
        return new Promise((resolve,reject) => {
            let grant_type = (opts.grant_type || '').toLowerCase();
            if (!grant_type) {
                return reject({type: 'validation', message: 'Grant Type missing'});
            }
            if (grant_type === 'password') {
                if (!opts.username || !opts.password) {
                    return reject({type: 'validation', message: 'Credentials missing'});
                }
                return passwordGrant(opts.username,opts.password).then(resolve).catch(reject);
            }

            if (grant_type === 'client_credentials') {
                return reject({type: 'validation', message: 'Not Implemented'});
            }

            return reject({type: 'validation', message: 'Invalid Grant Type specified'});
        });
    },

    authorize(auth) {
        log.debug('process authorize request');
        return new Promise((resolve,reject) => {
            // get bearer token from header
            if (!auth) {
                return reject({type: 'validation', message: 'Authorization header missing'});
            }
            if (!auth.scheme || auth.scheme.toLowerCase() !== 'bearer') {
                return reject({type: 'validation', message: 'Authorization scheme invalid'});
            }
            if (!auth.credentials) {
                return reject({type: 'validation', message: 'Authorization credentials missing'});
            }

            resolve(auth.credentials);
        })
        .then((authtoken) => {
            // fetch token
            log.debug('find token ' + authtoken);
            let tokens = Repository('tokens');
            return tokens.select({type: 'access', token: authtoken})
            .then((data) => {
                let token = data && data.length > 0 ? data[0] : null;
                if (!token) {
                    throw {type: 'process', message: 'Token not found'};
                }
                if (!!token.expires && token.expires < new Date()) {
                    throw {type: 'process', message: 'Token expired'};
                }
                return token.userId;
            });
        })
        .then((userid) => {            
            return getUser({userid: userid});
        })
        .then((user) => {
            return {
                userid: user.userid,
                username: user.username
            };
        })
        .catch((err) => {
            if (!err.hasOwnProperty('type')) {
                err = {type: 'process', message: JSON.stringify(err)};
            }
            throw err;
        });
    },

    authorise() {
        return (req,res,next) => {
            return this.authorize(req.authorization)
            .then((result) => {
                if (result) {
                    return next();
                }
                res.send(401);
            })
            .catch((err) => {
                let code = err.type == 'validation' ? 401 : 500;
                res.send(code, err.message);
            });
        };
    }
};
