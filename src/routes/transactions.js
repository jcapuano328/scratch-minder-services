'use strict'
var CrudRoutes = require('../lib/crud-routes'),
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

module.exports = CrudRoutes(opts);
