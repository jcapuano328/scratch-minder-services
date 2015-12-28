'use strict'
var crypto = require('crypto');

module.exports = () => {
    return new Promise((resolve,reject) => {
        crypto.randomBytes(256, (err, buffer) => {
            if (err) {
                return reject(err);
            }
            resolve(crypto.createHash('sha1').update(buffer).digest('hex'));
        });
    });
};
