'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('Respository', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();

        env.config = {
            db: {
                server: 'dbserver',
                port: 12345,
                name: 'scratchminder',
                options: {
                    server: {
                        maxPoolSize: 10
                    },
                    db: {
                        journal: true,
                        safe: true
                    }
                }
            }
        };

        env.connectionpool = {
            connect: sinon.stub(),
			disconnect: sinon.stub()
        };

		env.cursor = {
			toArray: sinon.stub()
		};
		env.collection = {
			find: sinon.stub(),
			insert: sinon.stub(),
			update: sinon.stub(),
			remove: sinon.stub(),
			save: sinon.stub()
		};
        env.db = {
			collection: sinon.stub().returns(env.collection)
        };

        env.Repository = sandbox.require('../../src/lib/repository', {
            requires: {
                'config': env.config,
                '../lib/log': env.log,
                '../lib/connection-pool': env.connectionpool
            }
        });
    });

    describe('instantiate', () => {
		beforeEach(() => {
			env.repo = env.Repository('foos');
		});
        it('should support the interface', () => {
            expect(env.repo).to.respondTo('connect');
			expect(env.repo).to.respondTo('disconnect');
            expect(env.repo).to.respondTo('select');
            expect(env.repo).to.respondTo('insert');
            expect(env.repo).to.respondTo('update');
            expect(env.repo).to.respondTo('remove');
        });
    });

    describe('connect', () => {
        describe('default database', () => {
            beforeEach((done) => {
                env.connectionpool.connect.returns(Promise.accept(env.db));
				env.repo = env.Repository('foos');
                env.repo.connect()
                .then((db) => {
                    env.db = db;
                    done();
                })
                .catch(done);
            });
            it('should retrieve from the connection pool', () => {
                expect(env.connectionpool.connect).to.have.been.calledOnce;
                expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
            });
            it('should retrieve a connection', () => {
                expect(env.db).to.not.be.null;
            });
        });

        describe('target database', () => {
            beforeEach((done) => {
                env.connectionpool.connect.returns(Promise.accept(env.db));
				env.repo = env.Repository('foos', 'bars');
                env.repo.connect()
                .then((db) => {
                    env.db = db;
                    done();
                })
                .catch(done);
            });
            it('should retrieve from the connection pool', () => {
                expect(env.connectionpool.connect).to.have.been.calledOnce;
                expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/bars');
            });
            it('should retrieve a connection', () => {
                expect(env.db).to.not.be.null;
            });
        });
    });

	describe('disconnect', () => {
		beforeEach((done) => {
			env.connectionpool.disconnect.returns(Promise.accept(true));
			env.repo = env.Repository('foos');
			env.repo.disconnect()
			.then((res) => {
				env.result = res;
				done();
			})
			.catch(done);
		});
		it('should disconnect from the connection pool', () => {
			expect(env.connectionpool.disconnect).to.have.been.calledOnce;
			//expect(env.connectionpool.disconnect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
		});
		it('should close the connection', () => {
			expect(env.result).to.be.true;
		});
	});

    describe('select', () => {
		beforeEach(() => {
			env.connectionpool.connect.returns(Promise.accept(env.db));
			env.repo = env.Repository('foos');
		});
		describe('found', () => {
            beforeEach((done) => {
				env.cursor.toArray.yields(null, [{name: 1}, {name: 2}]);
				env.collection.find.yields(null, env.cursor);
                env.repo.select({name: 'foo'})
                .then((data) => {
                    env.data = data;
                    done();
                })
                .catch(done);
            });
			it('should retrieve from the connection pool', () => {
                expect(env.connectionpool.connect).to.have.been.calledOnce;
                expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
            });
            it('should search the database', () => {
                expect(env.db.collection).to.have.been.calledOnce;
                expect(env.db.collection).to.have.been.calledWith('foos');
				expect(env.collection.find).to.have.been.calledOnce;
				expect(env.collection.find).to.have.been.calledWith({name: 'foo'});
            });
            it('should retrieve data', () => {
                expect(env.data).to.not.be.null;
            });
        });

		describe('not found', () => {
            beforeEach((done) => {
				env.cursor.toArray.yields(null, null);
				env.collection.find.yields(null, env.cursor);
                env.repo.select({name: 'foo'})
                .then((data) => {
                    env.data = data;
                    done();
                })
                .catch(done);
            });
			it('should retrieve from the connection pool', () => {
                expect(env.connectionpool.connect).to.have.been.calledOnce;
                expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
            });
            it('should search the database', () => {
                expect(env.db.collection).to.have.been.calledOnce;
                expect(env.db.collection).to.have.been.calledWith('foos');
				expect(env.collection.find).to.have.been.calledOnce;
				expect(env.collection.find).to.have.been.calledWith({name: 'foo'});
            });
            it('should retrieve data', () => {
                expect(env.data).to.be.null;
            });
        });
    });

    describe('insert', () => {
		beforeEach((done) => {
			env.connectionpool.connect.returns(Promise.accept(env.db));
			env.collection.insert.yields(null, true);
			env.repo = env.Repository('foos');
            env.repo.insert({name: 'foo'})
            .then((res) => {
                env.result = res;
                done();
            })
            .catch(done);
		});
		it('should retrieve from the connection pool', () => {
			expect(env.connectionpool.connect).to.have.been.calledOnce;
			expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
		});
        it('should insert into the database', () => {
			expect(env.db.collection).to.have.been.calledOnce;
			expect(env.db.collection).to.have.been.calledWith('foos');
			expect(env.collection.insert).to.have.been.calledOnce;
			expect(env.collection.insert).to.have.been.calledWith({name: 'foo'});
        });
        it('should be successful', () => {
            expect(env.result).to.be.true;
        });
    });

    describe('update', () => {
		beforeEach((done) => {
			env.connectionpool.connect.returns(Promise.accept(env.db));
			env.collection.update.yields(null, 1);
			env.repo = env.Repository('foos');
            env.repo.update({name: 'foo'}, {'$set': {value: 34}})
            .then((res) => {
                env.result = res;
                done();
            })
            .catch(done);
		});
		it('should retrieve from the connection pool', () => {
			expect(env.connectionpool.connect).to.have.been.calledOnce;
			expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
		});
        it('should update the database', () => {
			expect(env.db.collection).to.have.been.calledOnce;
			expect(env.db.collection).to.have.been.calledWith('foos');
			expect(env.collection.update).to.have.been.calledOnce;
			expect(env.collection.update).to.have.been.calledWith({name: 'foo'}, {$set: {value: 34}});
        });
        it('should be successful', () => {
            expect(env.result).to.equal(1);
        });
    });

    describe('remove', () => {
		beforeEach((done) => {
			env.connectionpool.connect.returns(Promise.accept(env.db));
			env.collection.remove.yields(null, 1);
			env.repo = env.Repository('foos');
            env.repo.remove({name: 'foo'})
            .then((res) => {
                env.result = res;
                done();
            })
            .catch(done);
		});
		it('should retrieve from the connection pool', () => {
			expect(env.connectionpool.connect).to.have.been.calledOnce;
			expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
		});
        it('should update the database', () => {
			expect(env.db.collection).to.have.been.calledOnce;
			expect(env.db.collection).to.have.been.calledWith('foos');
			expect(env.collection.remove).to.have.been.calledOnce;
			expect(env.collection.remove).to.have.been.calledWith({name: 'foo'});
        });
        it('should be successful', () => {
            expect(env.result).to.equal(1);
        });
    });

	describe('save', () => {
		beforeEach((done) => {
			env.connectionpool.connect.returns(Promise.accept(env.db));
			env.collection.save.yields(null, 1);
			env.repo = env.Repository('foos');
            env.repo.save({name: 'foo'})
            .then((res) => {
                env.result = res;
                done();
            })
            .catch(done);
		});
		it('should retrieve from the connection pool', () => {
			expect(env.connectionpool.connect).to.have.been.calledOnce;
			expect(env.connectionpool.connect).to.have.been.calledWith('mongodb://dbserver:12345/scratchminder');
		});
        it('should update the database', () => {
			expect(env.db.collection).to.have.been.calledOnce;
			expect(env.db.collection).to.have.been.calledWith('foos');
			expect(env.collection.save).to.have.been.calledOnce;
			expect(env.collection.save).to.have.been.calledWith({name: 'foo'});
        });
        it('should be successful', () => {
            expect(env.result).to.equal(1);
        });
    });

});
