'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('Connection Pool', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();

		env.mongodb = {
			MongoClient: {
				connect: sinon.stub()
			}
		};
        env.db = {
			close: sinon.stub()
        };

		env.pool = sandbox.require('../../src/lib/connection-pool', {
			requires: {
				'mongodb': env.mongodb,
				'../lib/log': env.log
			}
		});
    });

    describe('instantiate', () => {
        it('should support the interface', () => {
            expect(env.pool).to.respondTo('connect');
			expect(env.pool).to.respondTo('disconnect');
        });
    });

    describe('connect', () => {
        describe('not in cache', () => {
            beforeEach((done) => {
                env.mongodb.MongoClient.connect.yields(null, env.db);
                env.pool.connect('connstr')
                .then((db) => {
                    env.db = db;
                    done();
                })
                .catch(done);
            });
            it('should connect to database', () => {
                expect(env.mongodb.MongoClient.connect).to.have.been.calledOnce;
                expect(env.mongodb.MongoClient.connect).to.have.been.calledWith('connstr');
            });
            it('should retrieve a connection', () => {
                expect(env.db).to.not.be.null;
            });
        });

		describe('in cache', () => {
            beforeEach((done) => {
				env.pool = sandbox.require('../../src/lib/connection-pool', {
					requires: {
						'mongodb': env.mongodb,
						'../lib/log': env.log
					},
					locals: {
						pool: {'connstr': env.db}
					}
				});

                env.pool.connect('connstr')
                .then((db) => {
                    env.db = db;
                    done();
                })
                .catch(done);
            });
            it('should not connect to database', () => {
                expect(env.mongodb.MongoClient.connect).to.not.have.been.called;
            });
            it('should retrieve a connection from pool', () => {
                expect(env.db).to.not.be.null;
            });
        });
    });

	describe('disconnect', () => {
		describe('specific connection', () => {
			beforeEach((done) => {
				env.db.close.yields(null, null);
				env.sb = sandbox.load('../../src/lib/connection-pool', {
					requires: {
						'mongodb': env.mongodb,
						'../lib/log': env.log
					},
					locals: {
						pool: {'connstr': env.db}
					}
				});
				env.pool = env.sb.exports;

				env.pool.disconnect('connstr')
				.then((res) => {
					env.result = res;
					done();
				})
				.catch(done);
			});
			it('should disconnect from database', () => {
				expect(env.db.close).to.have.been.called;
				expect(env.result).to.be.true;
			});
			it('should remove connection from pool', () => {
				expect(env.sb.locals.pool).to.not.have.property('connstr');
			});
		});

		describe('all connections', () => {
			beforeEach((done) => {
				env.db.close.yields(null, null);
				env.sb = sandbox.load('../../src/lib/connection-pool', {
					requires: {
						'mongodb': env.mongodb,
						'../lib/log': env.log
					},
					locals: {
						pool: {'connstr': env.db, 'connstr2': env.db}
					}
				});
				env.pool = env.sb.exports;

				env.pool.disconnect()
				.then((res) => {
					env.result = res;
					done();
				})
				.catch(done);
			});
			it('should disconnect from database', () => {
				expect(env.db.close).to.have.been.calledTwice;
				expect(env.result).to.be.true;
			});
			it('should remove connections from pool', () => {
				expect(env.sb.locals.pool).to.not.have.property('connstr');
				expect(env.sb.locals.pool).to.not.have.property('connstr2');
			});
		});

	});
});
