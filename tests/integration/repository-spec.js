'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('Respository', () => {
	var env = {};
	beforeEach((done) => {
		env = {};
        env.log = sandbox.require('../mocks/log')();

        env.config = {
            db: {
                server: '192.168.60.17',
                port: 27017,
                name: 'integrationtest',
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

		env.foos = [
			{
				name: 'foo',
				value: 1
			},
			{
				name: 'bar',
				value: 2
			}
		];

        env.Repository = sandbox.require('../../src/lib/repository', {
            requires: {
                'config': env.config,
                '../lib/log': env.log
            }
        });
		env.repo = env.Repository('foos');

		env.db = sandbox.require('../lib/db', {
			requires: {
				'config': env.config
			}
		});
		env.db.resetAll('foos', env.foos)
		.then(() => {
			done();
		})
		.catch(done);
    });

    describe('connect', () => {
        describe('default database', () => {
            beforeEach((done) => {
                env.repo.connect()
                .then((db) => {
                    env.db = db;
                    done();
                })
                .catch(done);
            });
            it('should retrieve a connection', () => {
                expect(env.db).to.not.be.null;
            });
        });

        describe('target database', () => {
            beforeEach((done) => {
				env.repo = env.Repository('foos', 'bars');
                env.repo.connect()
                .then((db) => {
                    env.db = db;
                    done();
                })
                .catch(done);
            });
            it('should retrieve a connection', () => {
                expect(env.db).to.not.be.null;
            });
        });
    });

	describe('disconnect', () => {
		beforeEach((done) => {
			env.repo.disconnect()
			.then((res) => {
				env.result = res;
				done();
			})
			.catch(done);
		});
		it('should close the connection', () => {
			expect(env.result).to.be.true;
		});
	});

    describe('select', () => {
		describe('found', () => {
            beforeEach((done) => {
                env.repo.select({name: 'foo'})
                .then((data) => {
                    env.data = data;
                    done();
                })
                .catch(done);
            });
            it('should retrieve data', () => {
                expect(env.data).to.not.be.null;
				expect(env.data).to.have.length(1);
				expect(env.data[0]).to.have.property('name', 'foo');
				expect(env.data[0]).to.have.property('value', 1);
            });
        });

		describe('not found', () => {
            beforeEach((done) => {
                env.repo.select({name: 'fu'})
                .then((data) => {
                    env.data = data;
                    done();
                })
                .catch(done);
            });
            it('should retrieve no data', () => {
                expect(env.data).to.not.be.null;
				expect(env.data).to.be.an.array;
				expect(env.data).to.be.have.length(0);
            });
        });
    });

    describe('insert', () => {
		beforeEach((done) => {
			env.repo = env.Repository('foos');
            env.repo.insert({name: 'fubar', value: 3})
            .then((res) => {
                env.result = res;
				return env.db.retrieveAll('foos');
            })
			.then((data) => {
				env.data = data;
				done();
			})
            .catch(done);
		});
        it('should insert the data', () => {
            expect(env.result).to.not.be.null;
			expect(env.result).to.have.property('insertedCount', 1);
			expect(env.data).to.not.be.null;
			expect(env.data).to.be.an.array;
			expect(env.data).to.be.have.length(env.foos.length + 1);
			var item = env.data.find((el) => {return el.name == 'fubar';});
			expect(item).to.exist;
			expect(item).to.have.property('value', 3);
			//expect(env.data).to.deep.include.members([{name:'fubar', value: 3}]);
        });
    });

	/*
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
	*/
});
