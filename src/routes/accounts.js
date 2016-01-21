'use strict'
var CrudRoutes = require('../lib/crud-routes'),
    accounts = require('../services/accounts'),
    log = require('../lib/log');

let opts = {
    entity: 'accounts',
    service: accounts,
    user: true,
    parent: null,
    protected: true
};

module.exports = CrudRoutes(opts);
