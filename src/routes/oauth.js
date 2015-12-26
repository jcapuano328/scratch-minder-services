'use strict'

module.exports = (server) => {
    return [
        {
            method: 'post',
            uri: '/oauth/token',
            handler: server.oauth.grant()
        }
    ];
}
