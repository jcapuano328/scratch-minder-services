'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('CRUD Services', () => {
	var env = {};
	beforeEach(() => {
		env = {};
        env.log = sandbox.require('../mocks/log')();
        env.repo = {
            select: sinon.stub(),
            insert: sinon.stub(),
            update: sinon.stub(),
            remove: sinon.stub(),
            save: sinon.stub()
        };
        env.respository = sinon.stub().returns(env.repo);

		env.opts =  {
	        collection: 'stuffs',
	        collectionid: 'stuffid',
	        user: true,
			validators: {
				create: sinon.stub(),
				read: sinon.stub(),
				readAll: sinon.stub(),
				update: sinon.stub(),
				remove: sinon.stub(),
				removeAll: sinon.stub()
			}
	    };

		env.user = {
			username: 'testuser'
		};

		env.stuff = {
			a: 1,
			b: 2,
			c: 3
		};
		env.dbstuff = _.extend({_id: 'uniqueid'}, env.stuff);

		env.params = {};

        env.service = sandbox.require('../../src/lib/crud-services', {
            requires: {
                '../lib/repository': env.respository,
                '../lib/log': env.log
            }
        })(env.opts);
    });

    describe('interface', () => {
        it('should have a create', () => {
            expect(env.service).to.respondTo('create');
        });
		it('should have a read', () => {
            expect(env.service).to.respondTo('read');
        });
		it('should have a readAll', () => {
            expect(env.service).to.respondTo('readAll');
        });
		it('should have a update', () => {
            expect(env.service).to.respondTo('update');
        });
		it('should have a remove', () => {
            expect(env.service).to.respondTo('remove');
        });
		it('should have a removeAll', () => {
            expect(env.service).to.respondTo('removeAll');
        });
    });

    describe('create', () => {
        beforeEach(() => {
            env.handler = env.service.create;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.opts.validators.create.returns(Promise.accept(true));
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.insert.returns(Promise.accept(env.dbstuff));

                env.handler(env.params,env.stuff)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should create the stuffs respository', () => {
                expect(env.respository).to.have.been.calledWith('stuffs', env.user.username);
            });
            it('should insert the data', () => {
                expect(env.repo.insert).to.have.been.calledOnce;
                expect(env.repo.insert).to.have.been.calledWith(env.stuff);
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params,env.stuff)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('stuff invalid', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.opts.validators.create.returns(Promise.reject({type: 'validation', message: 'stuff missing'}));
				env.handler(env.params)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'stuff missing');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params, env.stuff)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the stuffs respository', () => {
                expect(env.respository).to.not.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the stuff', () => {
                expect(env.repo.select).to.not.have.been.calledWith({stuffid: 'stuff123'});
            });
        });
    });

    describe('read', () => {
        beforeEach(() => {
            env.handler = env.service.read;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'stuff123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.dbstuff]));

                env.handler(env.params)
				.then((result) => {
					env.result = result;
					done();
				})
				.catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the stuffs respository', () => {
                expect(env.respository).to.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the stuff', () => {
                expect(env.repo.select).to.have.been.calledWith({stuffid: 'stuff123'});
            });
            it('should return stuff', () => {
                expect(env.result).to.exist;
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
        });

        describe('stuff missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.opts.validators.read.returns(Promise.reject({type: 'validation', message: 'stuff id missing'}));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'stuff id missing');
					done();
				});
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'stuff123';
                env.repo.select.onFirstCall().returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the stuffs respository', () => {
                expect(env.respository).to.not.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the stuff', () => {
                expect(env.repo.select).to.not.have.been.calledWith({stuffid: 'stuff123'});
            });
        });

        describe('stuff not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'stuff123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'stuffs not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the stuffs respository', () => {
                expect(env.respository).to.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the stuff', () => {
                expect(env.repo.select).to.have.been.calledWith({stuffid: 'stuff123'});
            });
        });
    });

    describe('read all', () => {
        beforeEach(() => {
            env.handler = env.service.readAll;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.onFirstCall().returns(Promise.accept([env.user]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.dbstuff, env.dbstuff]));

				env.handler(env.params)
				.then((result) => {
					env.result = result;
					done();
				})
				.catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the stuffs respository', () => {
                expect(env.respository).to.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should select the stuff', () => {
                expect(env.repo.select).to.have.been.calledWith({});
            });
            it('should return stuffs', () => {
                expect(env.result).to.exist;
				expect(env.result).to.be.an.array;
				expect(env.result).to.have.length(2);
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.onFirstCall().returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the stuffs respository', () => {
                expect(env.respository).to.not.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the stuff', () => {
                expect(env.repo.select).to.not.have.been.calledWith({});
            });
        });
    });

    describe('update', () => {
        beforeEach(() => {
            env.handler = env.service.update;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.params.id = 'stuff123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.save.returns(Promise.accept(env.dbstuff));

                env.handler(env.params,env.stuff)
                .then((result) => {
					env.result = result;
					done();
				})
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should create the stuffs respository', () => {
                expect(env.respository).to.have.been.calledWith('stuffs', env.user.username);
            });
            it('should save the data', () => {
                expect(env.repo.save).to.have.been.calledOnce;
                expect(env.repo.save).to.have.been.calledWith(env.stuff);
            });
            it('should return the stuff', () => {
                expect(env.result).to.exist;
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.handler(env.params,env.stuff)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('stuff missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
				env.opts.validators.update.returns(Promise.reject({type: 'validation', message: 'stuff missing'}));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'stuff missing');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('stuff invalid', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.opts.validators.update.returns(Promise.reject({type: 'validation', message: 'stuff invalid'}));

				env.handler(env.params,env.stuff)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'stuff invalid');
					done();
				});
            });
            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params,env.stuff)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the stuffs respository', () => {
                expect(env.respository).to.not.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the data', () => {
                expect(env.repo.select).to.have.been.calledOnce;
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not select the stuff', () => {
                expect(env.repo.select).to.not.have.been.calledWith({stuffid: 'stuff123'});
            });
			it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });
    });

    describe.skip('remove', () => {
        beforeEach(() => {
            env.handler = env.service.remove;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'stuff123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.params)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the stuffs respository', () => {
                expect(env.respository).to.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should remove the stuff', () => {
                expect(env.repo.remove).to.have.been.calledWith({stuffid: 'stuff123'});
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete stuff', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });

        describe('stuff missing', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'stuff id missing');
					done();
				});
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete stuff', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.params.id = 'stuff123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the stuffs respository', () => {
                expect(env.respository).to.not.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not delete stuff', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });
    });

    describe.skip('delete all', () => {
        beforeEach(() => {
            env.handler = env.service.removeAll;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([env.user]));
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.params)
                .then(done)
                .catch(done);
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should create the stuffs respository', () => {
                expect(env.respository).to.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should remove the stuffs', () => {
                expect(env.repo.remove).to.have.been.calledWith({});
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'User id missing');
					done();
				});
            });
            it('should not create respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not select user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not delete stuff', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });

        describe('user not found', () => {
            beforeEach((done) => {
                env.params.userid = 'user123';
                env.repo.select.returns(Promise.accept([]));

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'process');
					expect(err).to.have.property('message', 'User not found');
					done();
				});
            });
            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the users respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should not create the stuffs respository', () => {
                expect(env.respository).to.not.have.been.calledWith('stuffs', env.user.username);
            });
            it('should select the user', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should not delete stuff', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });
    });	
});
