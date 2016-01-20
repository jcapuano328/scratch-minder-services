'use strict'
var log = require('../lib/log');

let createHandler = (service) => {
    return (req,res,next) => {
        return service.create(req.params,req.body)
        .then((data) => {
            res.send(201, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            res.send(code, err);
        });
    }
}

let readHandler = (service) => {
    return (req,res,next) => {
        return service.read(req.params)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            res.send(code, err);
        });
    }
}

let readAllHandler = (service) => {
    return (req,res,next) => {
        return service.readAll(req.params)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            res.send(code, err);
        });
    }
}

let updateHandler = (service) => {
    return (req,res,next) => {
        return service.update(req.params,req.body)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            res.send(code, err);
        });
    }
}

let removeHandler = (service) => {
    return (req,res,next) => {
        return service.remove(req.params)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            res.send(code, err);
        });
    }
}

let removeAllHandler = (service) => {
    return (req,res,next) => {
        return service.removeAll(req.params)
        .then((data) => {
            res.send(200, data);
        })
        .catch((err) => {
            let code = err.type === 'validation' ? 400 : 500;
            res.send(code, err);
        });
    }
}

let handler = (method, service) => {
    if (method == 'post') {
        return createHandler(service);
    }
    if (method == 'get') {
        return readHandler(service);
    }
    if (method == 'getall') {
        return readAllHandler(service);
    }
    if (method == 'put') {
        return updateHandler(service);
    }
    if (method == 'del') {
        return removeHandler(service);
    }
    if (method == 'delall') {
        return removeAllHandler(service);
    }
}

module.exports = (opts) => {
    opts = opts || {
        servicepath: '',
        service: '',
        user: true,
        parent: {
            name: '',
            idname: ''
        },
        protected: true
    };

    let servicepath = opts.servicepath || '../services/' + opts.service;
    let service = require(servicepath);
    let routes = [];

    ['post', 'get', 'put', 'del'].forEach((method) => {
        let uribase = (opts.user ? '/user/:userid' : '') +
            ((opts.parent && opts.parent.name) ? ('/' + opts.parent.name + '/:' + (opts.parent.idname || opts.parent.name + 'id')) : '') +
            '/' + opts.service;

        let uri = uribase;
        if (method == 'get' || method == 'put' || method == 'del') {
            uri += '/:id';
        }

        routes.push({
            method: method,
            uri: uri,
            protected: opts.protected,
            handler: handler(method, service)
        });
        if (method == 'get' || method == 'del') {
            routes.push({
                method: method,
                uri: uribase,
                protected: opts.protected,
                handler: handler(method + 'all', service)
            });
        }
    });

    return routes;
}
