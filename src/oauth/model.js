'use strict'
var easyPbkdf2 = require("easy-pbkdf2")(),
    Repository = require('../lib/repository'),
    log = require('../lib/log');

//
// Schemas definitions
//
var OAuthAccessTokensSchema = {
    accessToken: '{ type: String }',
    clientId: '{ type: String }',
    userId: '{ type: String }',
    expires: '{ type: Date }'
};

var OAuthRefreshTokensSchema = {
    refreshToken: '{ type: String }',
    clientId: '{ type: String }',
    userId: '{ type: String }',
    expires: '{ type: Date }'
};

var OAuthClientsSchema = {
    clientId: '{ type: String }',
    clientSecret: '{ type: String }',
    redirectUri: '{ type: String }'
};

var OAuthUsersSchema = {
    username: '{ type: String }',
    password: '{ type: String }',
    firstname: '{ type: String }',
    lastname: '{ type: String }',
    email: '{ type: String, default: "" }'
};

//
// oauth2-server callbacks
//
module.exports = {
    getAccessToken(bearerToken, callback) {
        log.trace('in getAccessToken (bearerToken: ' + bearerToken + ')');
        callback = callback || () => {};
        let repo = Repository('tokens');
        return repo.select({ token: bearerToken, type: 'access' })
        .then((data) => {
            if (data && data.length > 0) {
                return callback({
                    accessToken: data[0].token,
                    clientId: data[0].clientId,
                    userId: data[0].userId,
                    expires: data[0].expires
                });
            }
            return callback();
        })
        .catch(callback);
    },

    getClient(clientId, clientSecret, callback) {
        log.trace('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
        callback = callback || () => {};
        let repo = Repository('clients');
        let query = { clientId: clientId };
        if (clientSecret !== null) {
            query.clientSecret = clientSecret;
        }
        return repo.select(query)
        .then((data) => {
            if (data && data.length > 0) {
                return callback(data[0]);
            }
            return callback();
        })
        .catch(callback);
    },

    grantTypeAllowed(clientId, grantType, callback) {
        log.trace('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');
        callback = callback || () => {};
        // just permit all types...
        callback(null, true);
    },

    saveAccessToken(token, clientId, expires, userId, callback) {
        log.trace('in saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');
        callback = callback || () => {};
        let repo = Repository('tokens');
        return repo.save({
            token: token,
            type: 'access',
            clientId: clientId,
            userId: userId,
            expires: expires
        })
        .then(callback)
        .catch(callback);
    },

    /*
    * Required to support password grant type
    */
    getUser(username, password, callback) {
        log.trace('in getUser (username: ' + username + ', password: ' + password + ')');
        callback = callback || () => {};
        let repo = Repository('users');
        return repo.select({ username: username })
        .then((data) => {
            if (data && data.length > 0) {
                easyPbkdf2.verify( user.password.salt, user.password.hash, password, ( err, valid ) => {
                    if (!valid) {
                        return callback('Invalid username or password');
                    }
                    callback(null, data[0]._id);
                });
            }
            return callback(null, null);
        })
        .catch(callback);
    },

    /*
    * Required to support refreshToken grant type
    */
    saveRefreshToken(token, clientId, expires, userId, callback) {
        log.trace('in saveRefreshToken (token: ' + token + ', clientId: ' + clientId +', userId: ' + userId + ', expires: ' + expires + ')');
        callback = callback || () => {};
        let repo = Repository('tokens');
        return repo.save({
            token: token,
            type: 'refresh',
            clientId: clientId,
            userId: userId,
            expires: expires
        })
        .then(callback)
        .catch(callback);
    },

    getRefreshToken(refreshToken, callback) {
        log.trace('in getRefreshToken (refreshToken: ' + refreshToken + ')');
        callback = callback || () => {};
        let repo = Repository('tokens');
        return repo.select({ token: bearerToken, type: 'refresh' })
        .then((data) => {
            if (data && data.length > 0) {
                return callback({
                    refreshToken: data[0].token,
                    clientId: data[0].clientId,
                    userId: data[0].userId,
                    expires: data[0].expires
                });
            }
            return callback();
        })
        .catch(callback);
    }
};
