'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('Users Service', () => {
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
        env.Repository = sinon.stub().returns(env.repo);

		env.user = {
			userid: 'user123',
            username: 'testuser'
        };
        env.dbuser = _.extend({_id: 'uniqueid'}, env.user);

		env.params = {};

		env.passwordSvc = {
			verify: sinon.stub(),
			generate: sinon.stub()
		};

		env.crudServices = sandbox.require('../../src/lib/crud-services', {
			requires: {
				'../lib/repository': env.Repository,
				'../lib/log': env.log
			}
		});
        env.service = sandbox.require('../../src/services/users', {
            requires: {
                '../lib/crud-services': env.crudServices,
				'../lib/repository': env.Repository,
				'../lib/password': env.passwordSvc,
                '../lib/log': env.log
            }
        });
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
                env.params.id = 'user123';
				env.repo.select.returns(Promise.accept([env.user]));
                env.repo.insert.returns(Promise.accept(env.dbuser));

                env.handler(env.params,env.user)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the repositories', () => {
                expect(env.Repository).to.have.been.calledOnce;
            });
            it('should create the users repository', () => {
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should insert the data', () => {
                expect(env.repo.insert).to.have.been.calledOnce;
                expect(env.repo.insert).to.have.been.calledWith(env.user);
            });
        });

        describe('user id missing', () => {
            beforeEach((done) => {
				env.handler(env.params,env.user)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user id missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.params.id = 'user123';
				env.handler(env.params)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });

        describe('user username missing', () => {
            beforeEach((done) => {
                env.params.id = 'user123';
                env.user.username = null;
				env.handler(env.params, env.user)
				.then(done)
				.catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user username invalid');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not insert the data', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
        });
    });

    describe('read', () => {
        beforeEach(() => {
            env.handler = env.service.read;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.id = 'user123';
                env.repo.select.returns(Promise.accept([env.dbuser]));

                env.handler(env.params)
				.then((result) => {
					env.result = result;
					done();
				})
				.catch(done);
            });
            it('should create the users repository', () => {
				expect(env.Repository).to.have.been.calledOnce;
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should select the user', () => {
				expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({userid: 'user123'});
            });
            it('should return user', () => {
                expect(env.result).to.exist;
            });
        });

        describe('user id missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not select the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
        });
    });

    describe('read all', () => {
        beforeEach(() => {
            env.handler = env.service.readAll;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.repo.select.returns(Promise.accept([env.dbuser, env.dbuser]));

				env.handler(env.params)
				.then((result) => {
					env.result = result;
					done();
				})
				.catch(done);
            });
            it('should create the users repository', () => {
				expect(env.Repository).to.have.been.calledOnce;
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should select the users', () => {
				expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({});
            });
            it('should return users', () => {
                expect(env.result).to.exist;
				expect(env.result).to.be.an.array;
				expect(env.result).to.have.length(2);
            });
        });
    });

    describe('update', () => {
        beforeEach(() => {
            env.handler = env.service.update;
        });

        describe('success', () => {
            beforeEach((done) => {
				env.params.id = 'user123';
                env.repo.save.returns(Promise.accept(env.dbuser));

                env.handler(env.params,env.user)
                .then((result) => {
					env.result = result;
					done();
				})
                .catch(done);
            });
            it('should create the users repository', () => {
				expect(env.Repository).to.have.been.calledOnce;
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should save the user', () => {
                expect(env.repo.save).to.have.been.calledOnce;
                expect(env.repo.save).to.have.been.calledWith(env.user);
            });
            it('should return the user', () => {
                expect(env.result).to.exist;
            });
        });

        describe('user id missing', () => {
            beforeEach((done) => {
                env.handler(env.params,env.user)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user id missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not save the data', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('user missing', () => {
            beforeEach((done) => {
                env.params.id = 'user123';

				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user missing');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not save the user', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });

        describe('user username missing', () => {
            beforeEach((done) => {
                env.params.id = 'user123';
                env.user.username = '';

				env.handler(env.params,env.user)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user username invalid');
					done();
				});
            });
            it('should not create the repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not save the user', () => {
                expect(env.repo.save).to.not.have.been.called;
            });
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            env.handler = env.service.remove;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.params.id = 'user123';
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.params)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the users repository', () => {
				expect(env.Repository).to.have.been.calledOnce;
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should remove the user', () => {
                expect(env.repo.remove).to.have.been.calledWith({userid: 'user123'});
            });
        });

        describe('user id missing', () => {
            beforeEach((done) => {
				env.handler(env.params)
				.then(done)
                .catch((err) => {
					expect(err).to.have.property('type', 'validation');
					expect(err).to.have.property('message', 'user id missing');
					done();
				});
            });
            it('should not create repositories', () => {
                expect(env.Repository).to.not.have.been.called;
            });
            it('should not delete user', () => {
                expect(env.repo.remove).to.not.have.been.called;
            });
        });
    });

    describe('remove all', () => {
        beforeEach(() => {
            env.handler = env.service.removeAll;
        });

        describe('success', () => {
            beforeEach((done) => {
                env.repo.remove.returns(Promise.accept(true));

                env.handler(env.params)
                .then(() => {done();})
                .catch(done);
            });
            it('should create the users repository', () => {
				expect(env.Repository).to.have.been.calledOnce;
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should remove the users', () => {
                expect(env.repo.remove).to.have.been.calledWith({});
            });
        });
    });

	describe('reset password', () => {
        beforeEach(() => {
            env.handler = env.service.resetPassword;

			env.params.id = 'user123';
			env.data = {
				currentpwd: 'foo',
				newpwd: 'bar',
				confirmpwd: 'bar'
			};
			env.oldpassword = {
				salt: 'salt',
				hash: 'hash'
			};
			env.newpassword = {
				salt: 'salt2',
				hash: 'hash2'
			};
			env.user.password = env.oldpassword;
        });

        describe('success', () => {
            beforeEach((done) => {
				env.passwordSvc.verify.returns(Promise.accept(true));
				env.passwordSvc.generate.returns(Promise.accept(env.newpassword));
                env.repo.select.returns(Promise.accept([env.user]));
				env.repo.save.returns(Promise.accept([env.user]));

                env.handler(env.params,env.data)
                .then((data) => {
					env.newuser = data;
					done();
				})
                .catch(done);
            });
            it('should create the users repository', () => {
				expect(env.Repository).to.have.been.calledOnce;
                expect(env.Repository).to.have.been.calledWith('users');
            });
            it('should retrieve the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: env.params.id});
            });
			it('should verify the current password', () => {
                expect(env.passwordSvc.verify).to.have.been.calledWith(env.data.currentpwd, env.oldpassword.salt, env.oldpassword.hash);
            });
			it('should generate the new password', () => {
                expect(env.passwordSvc.generate).to.have.been.calledWith(env.data.newpwd);
				expect(env.user).to.have.property('password', env.newpassword);
            });
			it('should save the user', () => {
                expect(env.repo.save).to.have.been.calledWith(env.user);
            });
			it('should return the user', () => {
                expect(env.newuser).to.exist;
            });
        });
    });

});
