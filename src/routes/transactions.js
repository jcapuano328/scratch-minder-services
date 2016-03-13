'use strict'
var _ = require('lodash'),
    CrudRoutes = require('../lib/crud-routes'),
    transactions = require('../services/transactions'),
    log = require('../lib/log');

let opts = {
    entity: 'transactions',
    service: transactions,
    user: true,
    parent: {
        name: 'account'
    },
    protected: true
};

let routes = CrudRoutes(opts);

routes.push({
    method: 'get',
    uri: '/user/:userid/accounts/:accountid/transactions/search/:kind/:search',
    protected: true,
    handler: (req,res,next) => {
        log.info('Search Transactions by ' + req.params.kind + '/' + req.params.search);
        return transactions.search(req.params)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            log.error('Error searching transactions: ' + err.message);
            res.send(400, err.message);
        });
    }
});


routes.push({
    method: 'get',
    uri: '/user/:userid/accounts/:accountid/transactions/startdate/:startdate/enddate/:enddate',
    protected: true,
    handler: (req,res,next) => {
        log.info('Retrieve Transactions from ' + req.params.startdate + '-' + req.params.enddate);
        return transactions.search(req.params)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            log.error('Error searching transactions: ' + err.message);
            res.send(400, err.message);
        });
    }
});

routes.push({
    method: 'get',
    uri: '/user/:userid/accounts/:accountid/transactions/startdate/:startdate/enddate/:enddate/:groupby',
    protected: true,
    handler: (req,res,next) => {
        log.info('Retrieve Transactions from ' + req.params.startdate + ' to ' + req.params.enddate);
        return transactions.search(req.params)
        .then((data) => {
            log.debug('Grouping by ' + req.params.groupby);
            let a = _.groupBy(data, req.params.groupby);
            res.send(200, a);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            log.error('Error searching transactions: ' + err.message);
            res.send(400, err.message);
        });
    }
});

module.exports = routes;
