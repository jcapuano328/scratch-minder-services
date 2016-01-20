'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('CRUD routes', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
		env.services = {
			create: sinon.stub(),
			read: sinon.stub(),
			readAll: sinon.stub(),
			update: sinon.stub(),
			remove: sinon.stub(),
			removeAll: sinon.stub()
		};

		env.opts =  {
	        service: 'crud-services',
			servicepath: '../lib/crud-services',
	        user: true,
	        parent: {
	            name: 'other',
	            idname: 'other_id'
	        },
	        protected: true
	    };

        env.routes = sandbox.require('../../src/lib/crud-routes', {
            requires: {
                '../lib/crud-services': env.services,
                '../lib/log': env.log
            }
        })(env.opts);
    });

    describe('interface', () => {
        it('should have a 6 routes', () => {
            expect(env.routes).to.be.an.array;
            expect(env.routes).to.have.length(6);
        });

        describe('create', () => {
            beforeEach(() => {
                env.route = env.routes[0];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'post');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/other/:other_id/crud-services');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('read', () => {
            beforeEach(() => {
                env.route = env.routes[1];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'get');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/other/:other_id/crud-services/:id');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('read for user', () => {
            beforeEach(() => {
                env.route = env.routes[2];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'get');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/other/:other_id/crud-services');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('update', () => {
            beforeEach(() => {
                env.route = env.routes[3];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'put');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/other/:other_id/crud-services/:id');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('delete', () => {
            beforeEach(() => {
                env.route = env.routes[4];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'del');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/other/:other_id/crud-services/:id');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
        describe('delete all for user', () => {
            beforeEach(() => {
                env.route = env.routes[5];
            });
            it('should have a method', () => {
                expect(env.route).to.have.property('method', 'del');
            });
            it('should have a uri', () => {
                expect(env.route).to.have.property('uri', '/user/:userid/other/:other_id/crud-services');
            });
            it('should not be protected', () => {
                expect(env.route).to.have.property('protected', true);
            });
            it('should have a handler', () => {
                expect(env.route).to.respondTo('handler');
            });
        });
    });

    describe('handlers', () => {
        beforeEach(() => {
            env.req = {
                body: {},
                params: {}
            };
            env.res = {
                send: sinon.stub()
            };
            env.next = sinon.stub();

            env.user = {
                username: 'testuser'
            };

			env.stuff = {
				a: 1,
				b: 2,
				c: 3
			};
            env.dbstuff = _.extend({_id: 'uniqueid'}, env.stuff);
        });

        describe('create', () => {
            beforeEach(() => {
                env.handler = env.routes[0].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.stuff;
                    env.services.create.returns(Promise.accept(env.dbstuff));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
                it('should invoke the stuff service', () => {
                    expect(env.services.create).to.have.been.calledOnce;
                    expect(env.services.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return created to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(201, sinon.match(env.dbstuff));
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.req.body = env.stuff;
					env.services.create.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.create).to.have.been.calledOnce;
                    expect(env.services.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('stuff missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = null;
					env.services.create.returns(Promise.reject({type: 'validation', message: 'Stuff missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.create).to.have.been.calledOnce;
                    expect(env.services.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Stuff missing'}));
                });
            });

            describe('stuff invalid missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.stuff;
					env.services.create.returns(Promise.reject({type: 'validation', message: 'Stuff invalid'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.create).to.have.been.calledOnce;
                    expect(env.services.create).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'Stuff invalid'}));
                });
            });
        });

        describe('read', () => {
            beforeEach(() => {
                env.handler = env.routes[1].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'stuff123';
					env.services.read.returns(Promise.accept([env.dbstuff]));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.read).to.have.been.calledOnce;
                    expect(env.services.read).to.have.been.calledWith(env.req.params);
                });
                it('should return stuff to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbstuff]));
                });
            });

            describe('user missing', () => {
				beforeEach((done) => {
					env.req.body = env.stuff;
					env.services.read.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

					env.handler(env.req,env.res,env.next)
					.then(() => {done();})
					.catch(done);
				});
				it('should invoke the stuff service', () => {
					expect(env.services.read).to.have.been.calledOnce;
					expect(env.services.read).to.have.been.calledWith(env.req.params);
				});
				it('should return an error to the caller', () => {
					expect(env.res.send).to.have.been.calledOnce;
					expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
				});
            });

            describe('stuff missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.services.read.returns(Promise.reject({type: 'validation', message: 'stuff id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
					expect(env.services.read).to.have.been.calledOnce;
					expect(env.services.read).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'stuff id missing'}));
                });
            });

            describe('stuff not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'stuff123';
					env.services.read.returns(Promise.reject({type: 'process', message: 'stuff not found'}));

                    env.handler(env.req,env.res,env.next)
					.then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
					expect(env.services.read).to.have.been.calledOnce;
					expect(env.services.read).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'stuff not found'}));
                });
            });
        });

        describe('read all', () => {
            beforeEach(() => {
                env.handler = env.routes[2].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.services.readAll.returns(Promise.accept([env.dbstuff, env.dbstuff]));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
					expect(env.services.readAll).to.have.been.calledOnce;
					expect(env.services.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return stuff to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match([env.dbstuff,env.dbstuff]));
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.services.readAll.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
					expect(env.services.readAll).to.have.been.calledOnce;
					expect(env.services.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.services.readAll.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
					expect(env.services.readAll).to.have.been.calledOnce;
					expect(env.services.readAll).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });

        describe('update', () => {
            beforeEach(() => {
                env.handler = env.routes[3].handler;
            });
            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = env.stuff;
                    env.services.update.returns(Promise.accept(env.dbstuff));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
					expect(env.services.update).to.have.been.calledOnce;
					expect(env.services.update).to.have.been.calledWith(env.req.params,env.req.body);
				});
                it('should return updated to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, sinon.match(env.dbstuff));
                });
            });

            describe('user missing', () => {
				beforeEach((done) => {
					env.req.body = env.stuff;
					env.services.update.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
					expect(env.services.update).to.have.been.calledOnce;
					expect(env.services.update).to.have.been.calledWith(env.req.params);
				});
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('stuff missing', () => {
				beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.body = null;
					env.services.update.returns(Promise.reject({type: 'validation', message: 'stuff missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.update).to.have.been.calledOnce;
                    expect(env.services.update).to.have.been.calledWith(env.req.params,env.req.body);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'stuff missing'}));
                });
            });
        });

        describe('delete', () => {
            beforeEach(() => {
                env.handler = env.routes[4].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
                    env.req.params.id = 'stuff123';
                    env.services.remove.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.remove).to.have.been.calledOnce;
                    expect(env.services.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.services.remove.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.remove).to.have.been.calledOnce;
                    expect(env.services.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('stuff missing', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.services.remove.returns(Promise.reject({type: 'validation', message: 'stuff id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.remove).to.have.been.calledOnce;
                    expect(env.services.remove).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'stuff id missing'}));
                });
            });
        });

        describe('delete all', () => {
            beforeEach(() => {
                env.handler = env.routes[5].handler;
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.services.removeAll.returns(Promise.accept(true));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.removeAll).to.have.been.calledOnce;
                    expect(env.services.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return result to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(200, true);
                });
            });

            describe('user missing', () => {
                beforeEach((done) => {
					env.services.removeAll.returns(Promise.reject({type: 'validation', message: 'User id missing'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.removeAll).to.have.been.calledOnce;
                    expect(env.services.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(400, sinon.match({"message": 'User id missing'}));
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.req.params.userid = 'user123';
					env.services.removeAll.returns(Promise.reject({type: 'process', message: 'User not found'}));

                    env.handler(env.req,env.res,env.next)
                    .then(() => {done();})
                    .catch(done);
                });
				it('should invoke the stuff service', () => {
                    expect(env.services.removeAll).to.have.been.calledOnce;
                    expect(env.services.removeAll).to.have.been.calledWith(env.req.params);
                });
                it('should return an error to the caller', () => {
                    expect(env.res.send).to.have.been.calledOnce;
                    expect(env.res.send).to.have.been.calledWith(500, sinon.match({"message": 'User not found'}));
                });
            });
        });
    });
});
