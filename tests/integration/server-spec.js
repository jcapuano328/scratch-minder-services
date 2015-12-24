'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('Server', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
        env.config = {
            port: 8888
        };
        env.router = {
            register: sinon.stub()
        };

        env.server = sandbox.require('../../lib/server', {
			requires: {
                'config': env.config,
                './router': env.router,
                './log': env.log
            }
		});

		env.router.register.returns(Promise.resolve());
		env.restifyServer.listen.yields(null);
		return env.server.start();
    });
    afterEach(() => {
        env.server.stop();
    });

	describe('accept connections', () => {
    });

});
