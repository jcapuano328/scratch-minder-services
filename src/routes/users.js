'use strict'
var CrudRoutes = require('../lib/crud-routes'),
    users = require('../services/users'),
    log = require('../lib/log');

let opts = {
    entity: 'users',
    service: users,
    user: false,
    parent: null,
    protected: true
};

module.exports = CrudRoutes(opts);
