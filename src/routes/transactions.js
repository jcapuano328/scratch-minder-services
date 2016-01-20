'use strict'
var config = require('config'),
    accounts = require('../services/transactions'),
    log = require('../lib/log');

module.exports = [
    {
        method: 'post',
        uri: '/user/:userid/account/:accountid/transactions',
        protected: true,
        handler: (req,res,next) => {
            return transactions.create(req.params,req.body)
            .then((data) => {
                res.send(201, data);
            })
            .catch((err) => {
                let code = err.type === 'validation' ? 400 : 500;
                res.send(code, err);
            });
        }
    },
    {
        method: 'get',
        uri: '/user/:userid/account/:accountid/transactions/:id',
        protected: true,
        handler: (req,res,next) => {
            return transactions.read(req.params)
            .then((data) => {
                res.send(200, data);
            })
            .catch((err) => {
                let code = err.type === 'validation' ? 400 : 500;
                res.send(code, err);
            });
        }
    },
    {
        method: 'get',
        uri: '/user/:userid/account/:accountid/transactions',
        protected: true,
        handler: (req,res,next) => {
            return transactions.readAll(req.params)
            .then((data) => {
                res.send(200, data);
            })
            .catch((err) => {
                let code = err.type === 'validation' ? 400 : 500;
                res.send(code, err);
            });
        }
    },
    {
        method: 'put',
        uri: '/user/:userid/account/:accountid/transactions/:id',
        protected: true,
        handler: (req,res,next) => {
            return transactions.update(req.params,req.body)
            .then((data) => {
                res.send(200, data);
            })
            .catch((err) => {
                let code = err.type === 'validation' ? 400 : 500;
                res.send(code, err);
            });
        }
    },
    {
        method: 'del',
        uri: '/user/:userid/account/:accountid/transactions/:id',
        protected: true,
        handler: (req,res,next) => {
            return transactions.remove(req.params)
            .then((data) => {
                res.send(200, data);
            })
            .catch((err) => {
                let code = err.type === 'validation' ? 400 : 500;
                res.send(code, err);
            });
        }
    },
    {
        method: 'del',
        uri: '/user/:userid/account/:accountid/transactions',
        protected: true,
        handler: (req,res,next) => {
            return transactions.removeAll(req.params)
            .then((data) => {
                res.send(200, data);
            })
            .catch((err) => {
                let code = err.type === 'validation' ? 400 : 500;
                res.send(code, err);
            });
        }
    }
];
