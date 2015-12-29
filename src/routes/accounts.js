'use strict'
var accounts = require('../services/accounts'),
    log = require('../lib/log');

module.exports = [
    {
        method: 'post',
        uri: '/user/:userid/accounts',
        protected: true,
        handler: (req,res,next) => {
            return accounts.create(req.params,req.body)
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
        uri: '/user/:userid/accounts/:id',
        protected: true,
        handler: (req,res,next) => {
            return accounts.read(req.params)
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
        uri: '/user/:userid/accounts',
        protected: true,
        handler: (req,res,next) => {
            return accounts.readAll(req.params)
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
        uri: '/user/:userid/accounts/:id',
        protected: true,
        handler: (req,res,next) => {
            return accounts.update(req.params,req.body)
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
        uri: '/user/:userid/accounts/:id',
        protected: true,
        handler: (req,res,next) => {
            return accounts.remove(req.params)
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
        uri: '/user/:userid/accounts',
        protected: true,
        handler: (req,res,next) => {
            return accounts.removeAll(req.params)
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
