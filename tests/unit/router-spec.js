'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
	path = require('path');
chai.use(require('sinon-chai'));

describe('Router', () => {
	var env = {};
	beforeEach(() => {
		env = {};
		env.log = sandbox.require('../mocks/log')();

		env.config = {
			paths: {
				routes: path.join(__dirname, '..', 'fixtures', 'routes')
			}
		};
		env.file = {
			walk: sinon.stub()
		};
		env.server = {
	        get: sinon.stub(),
	        post: sinon.stub(),
			put: sinon.stub(),
			del: sinon.stub()
		};
		env.routes = {
			file1: {
				path: path.join(env.config.paths.routes, 'file1.js'),
				routes: [
					{
						method: 'get',
						uri: '/path/to/resource1',
						handler: sinon.stub()
					},
					{
						method: 'post',
						uri: '/path/to/resource2',
						handler: sinon.stub()
					}
				]
			},
			file2: {
				path: path.join(env.config.paths.routes, 'sub', 'file2.js'),
				routes: [
					{
						method: 'put',
						uri: '/path/to/resource3',
						handler: sinon.stub()
					},
					{
						method: 'delete',
						uri: '/path/to/resource4',
						handler: sinon.stub()
					}
				]
			}
		};

		env.modules = {
			'config': env.config,
			'file': env.file,
			'./log': env.log
		};
		env.modules[env.routes.file1.path] = env.routes.file1.routes;
		env.modules[env.routes.file2.path] = env.routes.file2.routes;

		env.router = sandbox.require('../../lib/router', {
			requires: env.modules
		});
	});

	describe('register', () => {
		beforeEach((done) => {
			env.file.walk.yields(null, null, null, [env.routes.file1.path, env.routes.file2.path]);

			env.router.register(env.server)
			.then(() => { done(); })
			.catch(done);
		});
		it('should load the route definitions', () => {
			expect(env.file.walk).to.have.been.calledWith(env.config.paths.routes);
		});
		it('should register the route definitions', () => {
			expect(env.server.get).to.have.been.called;
			expect(env.server.post).to.have.been.called;
			expect(env.server.put).to.have.been.called;
			expect(env.server.del).to.have.been.called;
		});
	});
});