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

let routes = CrudRoutes(opts);
routes.push({
    method: 'put',
    uri: '/users/:id/reset',
    protected: true,
    handler: (req,res,next) => {
        log.info('Reset User Password');
        return users.resetPassword(req.params,req.body)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            log.error('Error resetting user password: ' + err.message);
            res.send(400, err.message);
        });
    }
});

module.exports = routes;
