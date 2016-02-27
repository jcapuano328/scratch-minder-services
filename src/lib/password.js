'use strict'
var easyPbkdf2 = require("easy-pbkdf2")();

module.exports = {
    generate(password) {
        return new Promise((resolve,reject) => {
            easyPbkdf2.secureHash(password, easyPbkdf2.generateSalt(), (err, passwordHash, originalSalt) => {
                if (err) {
                    return reject(err);
                }
                resolve({
                    salt: originalSalt,
                    hash: passwordHash
                });
            });
        });
    },
    verify(password, salt, hash) {
        return new Promise((resolve,reject) => {
            easyPbkdf2.verify(salt, hash, password, (err, valid) => {                
                if (err) {
                    return reject(err);
                }
                resolve(valid);
            });
        });
    }
};
