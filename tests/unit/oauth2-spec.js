'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('OAuth2 Service', () => {
	var env = {};
    function nowPlusMins(mins) {
        let now = new Date();
        return new Date(now.getTime() + (mins*60000));
    }

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
        env.user = {
            userid: 'user123',
            username: 'foo',
            status: 'active',
            password: {
                salt: '123',
                hash: 'abc'
            }
        };

        env.crypto = {
            verify: sinon.stub()
        };

        env.oauth2 = sandbox.require('../../src/services/oauth2', {
            requires: {
                'easy-pbkdf2': sinon.stub().returns(env.crypto),
                '../lib/repository': env.respository,
                '../lib/log': env.log
            }
        });
    });

    describe('grant', () => {
        describe('password', () => {
            beforeEach(() => {
                env.params = {
                    'grant_type': 'password',
                    username: 'foo',
                    password: 'bar'
                };
            });

            describe('success', () => {
                beforeEach((done) => {
                    env.repo.select.returns(Promise.accept([env.user]));
                    env.repo.insert.returns(Promise.accept());
                    env.crypto.verify.yields(null, true);

                    env.oauth2.grant(env.params)
                    .then((token) => {
                        env.token = token;
                        done();
                    })
                    .catch(done);
                });
                it('should create the respositories', () => {
                    expect(env.respository).to.have.been.calledTwice;
                });
                it('should create the user respository', () => {
                    expect(env.respository).to.have.been.calledWith('users');
                });
                it('should fetch the user', () => {
                    expect(env.repo.select).to.have.been.calledOnce;
                    expect(env.repo.select).to.have.been.calledWith({username: env.params.username});
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.calledWith({clientId: sinon.match.string, clientKey: sinon.match.string});
                });
                it('should verify the password', () => {
                    expect(env.crypto.verify).to.have.been.calledOnce;
                    expect(env.crypto.verify).to.have.been.calledWith(env.user.password.salt, env.user.password.hash, env.params.password, sinon.match.func);
                });
                it('should create the tokens respository', () => {
                    expect(env.respository).to.have.been.calledWith('tokens');
                });
                it('should save the token', () => {
                    expect(env.repo.insert).to.have.been.calledOnce;
                });
                it('should return the token', () => {
                    expect(env.token).to.exist;
                });
            });

            describe('user name missing', () => {
                beforeEach((done) => {
                    delete env.params['username'];

                    env.oauth2.grant(env.params)
                    .then(() => {
                        done('should not succeed');
                    })
                    .catch((err) => {
                        expect(err).to.have.property('type', 'validation');
                        expect(err).to.have.property('message', 'Credentials missing');
                        done();
                    });
                });
                it('should not create the respositories', () => {
                    expect(env.respository).to.not.have.been.called;
                });
                it('should not fetch the user', () => {
                    expect(env.repo.select).to.not.have.been.called;
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.called;
                });
                it('should not verify the password', () => {
                    expect(env.crypto.verify).to.not.have.been.called;
                });
                it('should not save the token', () => {
                    expect(env.repo.insert).to.not.have.been.called;
                });
                it('should not return the token', () => {
                    expect(env.token).to.not.exist;
                });
            });

            describe('password missing', () => {
                beforeEach((done) => {
                    delete env.params['password'];

                    env.oauth2.grant(env.params)
                    .then(() => {
                        done('should not succeed');
                    })
                    .catch((err) => {
                        expect(err).to.have.property('type', 'validation');
                        expect(err).to.have.property('message', 'Credentials missing');
                        done();
                    });
                });
                it('should not create the respositories', () => {
                    expect(env.respository).to.not.have.been.called;
                });
                it('should not fetch the user', () => {
                    expect(env.repo.select).to.not.have.been.called;
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.called;
                });
                it('should not verify the password', () => {
                    expect(env.crypto.verify).to.not.have.been.called;
                });
                it('should not save the token', () => {
                    expect(env.repo.insert).to.not.have.been.called;
                });
                it('should not return the token', () => {
                    expect(env.token).to.not.exist;
                });
            });

            describe('user not found', () => {
                beforeEach((done) => {
                    env.repo.select.returns(Promise.accept([]));

                    env.oauth2.grant(env.params)
                    .then(() => {
                        done('should not succeed');
                    })
                    .catch((err) => {
                        expect(err).to.have.property('type', 'process');
                        expect(err).to.have.property('message', 'User not found');
                        done();
                    });
                });
                it('should create the respositories', () => {
                    expect(env.respository).to.have.been.calledOnce;
                });
                it('should create the user respository', () => {
                    expect(env.respository).to.have.been.calledWith('users');
                });
                it('should fetch the user', () => {
                    expect(env.repo.select).to.have.been.calledOnce;
                    expect(env.repo.select).to.have.been.calledWith({username: env.params.username});
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.calledWith({clientId: sinon.match.string, clientKey: sinon.match.string});
                });
                it('should not verify the password', () => {
                    expect(env.crypto.verify).to.not.have.been.called;
                });
                it('should not save the token', () => {
                    expect(env.repo.insert).to.not.have.been.called;
                });
                it('should not return the token', () => {
                    expect(env.token).to.not.exist;
                });
            });

            describe('user inactive', () => {
                beforeEach((done) => {
                    env.user.status = 'inactive';
                    env.repo.select.returns(Promise.accept([env.user]));

                    env.oauth2.grant(env.params)
                    .then(() => {
                        done('should not succeed');
                    })
                    .catch((err) => {
                        expect(err).to.have.property('type', 'process');
                        expect(err).to.have.property('message', 'Account is inactive');
                        done();
                    });
                });
                it('should create the respositories', () => {
                    expect(env.respository).to.have.been.calledOnce;
                });
                it('should create the user respository', () => {
                    expect(env.respository).to.have.been.calledWith('users');
                });
                it('should fetch the user', () => {
                    expect(env.repo.select).to.have.been.calledOnce;
                    expect(env.repo.select).to.have.been.calledWith({username: env.params.username});
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.calledWith({clientId: sinon.match.string, clientKey: sinon.match.string});
                });
                it('should not verify the password', () => {
                    expect(env.crypto.verify).to.not.have.been.called;
                });
                it('should not save the token', () => {
                    expect(env.repo.insert).to.not.have.been.called;
                });
                it('should not return the token', () => {
                    expect(env.token).to.not.exist;
                });
            });

            describe('user locked', () => {
                beforeEach((done) => {
                    env.user.status = 'locked';
                    env.repo.select.returns(Promise.accept([env.user]));

                    env.oauth2.grant(env.params)
                    .then(() => {
                        done('should not succeed');
                    })
                    .catch((err) => {
                        expect(err).to.have.property('type', 'process');
                        expect(err).to.have.property('message', 'Account is locked');
                        done();
                    });
                });
                it('should create the respositories', () => {
                    expect(env.respository).to.have.been.calledOnce;
                });
                it('should create the user respository', () => {
                    expect(env.respository).to.have.been.calledWith('users');
                });
                it('should fetch the user', () => {
                    expect(env.repo.select).to.have.been.calledOnce;
                    expect(env.repo.select).to.have.been.calledWith({username: env.params.username});
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.calledWith({clientId: sinon.match.string, clientKey: sinon.match.string});
                });
                it('should not verify the password', () => {
                    expect(env.crypto.verify).to.not.have.been.called;
                });
                it('should not save the token', () => {
                    expect(env.repo.insert).to.not.have.been.called;
                });
                it('should not return the token', () => {
                    expect(env.token).to.not.exist;
                });
            });

            describe('password mismatch', () => {
                beforeEach((done) => {
                    env.repo.select.returns(Promise.accept([env.user]));
                    env.crypto.verify.yields(null, false);

                    env.oauth2.grant(env.params)
                    .then(() => {
                        done('should not succeed');
                    })
                    .catch((err) => {
                        expect(err).to.have.property('type', 'process');
                        expect(err).to.have.property('message', 'Invalid Credentials specified');
                        done();
                    });
                });
                it('should create the respositories', () => {
                    expect(env.respository).to.have.been.calledOnce;
                });
                it('should create the user respository', () => {
                    expect(env.respository).to.have.been.calledWith('users');
                });
                it('should fetch the user', () => {
                    expect(env.repo.select).to.have.been.calledOnce;
                    expect(env.repo.select).to.have.been.calledWith({username: env.params.username});
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.calledWith({clientId: sinon.match.string, clientKey: sinon.match.string});
                });
                it('should verify the password', () => {
                    expect(env.crypto.verify).to.have.been.calledOnce;
                    expect(env.crypto.verify).to.have.been.calledWith(env.user.password.salt, env.user.password.hash, env.params.password, sinon.match.func);
                });
                it('should not create the tokens respository', () => {
                    expect(env.respository).to.not.have.been.calledWith('tokens');
                });
                it('should not save the token', () => {
                    expect(env.repo.insert).to.not.have.been.called;
                });
                it('should not return the token', () => {
                    expect(env.token).to.not.exist;
                });
            });
        });

        describe('client credentials', () => {
            beforeEach(() => {
                env.params = {
                    'grant_type': 'client_credentials',
                    client_id: 'foo',
                    client_secret: 'bar'
                };
            });

            describe('not implemented', () => {
                beforeEach((done) => {
                    env.oauth2.grant(env.params)
                    .then(() => {
                        done('should not succeed');
                    })
                    .catch((err) => {
                        expect(err).to.have.property('type', 'validation');
                        expect(err).to.have.property('message', 'Not Implemented');
                        done();
                    });
                });

                it('should not create the respositories', () => {
                    expect(env.respository).to.not.have.been.called;
                });
                it('should not fetch the user', () => {
                    expect(env.repo.select).to.not.have.been.called;
                });
                it('should not fetch the client', () => {
                    expect(env.repo.select).to.not.have.been.called;
                });
                it('should not verify the password', () => {
                    expect(env.crypto.verify).to.not.have.been.called;
                });
                it('should not save the token', () => {
                    expect(env.repo.insert).to.not.have.been.called;
                });
                it('should not return the token', () => {
                    expect(env.token).to.not.exist;
                });
            });
        });

        describe('invalid type', () => {
            beforeEach((done) => {
                env.params = {
                    'grant_type': 'whatever'
                };
                env.oauth2.grant(env.params)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'validation');
                    expect(err).to.have.property('message', 'Invalid Grant Type specified');
                    done();
                });
            });

            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not fetch the client', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not verify the password', () => {
                expect(env.crypto.verify).to.not.have.been.called;
            });
            it('should not save the token', () => {
                expect(env.repo.insert).to.not.have.been.called;
            });
            it('should not return the token', () => {
                expect(env.token).to.not.exist;
            });
        });
    });

    describe('authorize', () => {
        beforeEach(() => {
            env.token = {
                "token": "authtoken",
                "type": "access",
                "clientId": null,
                "userId": env.user.userid,
                "expires": nowPlusMins(15)
            };

            env.authorization = {
                scheme: 'Bearer',
                credentials: env.token.token
            };

            env.userclean = _.pick(env.user, 'userid', 'username');
        });
        describe('success', () => {
            beforeEach((done) => {
                env.repo.select.onFirstCall().returns(Promise.accept([env.token]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.user]));

                env.oauth2.authorize(env.authorization)
                .then((user) => {
                    env.result = user;
                    done();
                })
                .catch(done);
            });

            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should create the tokens respository', () => {
                expect(env.respository).to.have.been.calledWith('tokens');
            });
            it('should retrieve the token', () => {
                expect(env.repo.select).to.have.been.calledWith({type: 'access', token: env.authorization.credentials});
            });
            it('should create the user respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: env.token.userid});
            });
            it('should return the user', () => {
                expect(env.result).to.exist;
                expect(env.result).to.deep.equal(env.userclean);
            });
        });
        describe('auth missing', () => {
            beforeEach((done) => {
                env.oauth2.authorize()
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'validation');
                    expect(err).to.have.property('message', 'Authorization header missing');
                    done();
                });
            });

            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not fetch any data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
        describe('invalid auth scheme', () => {
            beforeEach((done) => {
                env.authorization.scheme = 'Fubar';
                env.oauth2.authorize(env.authorization)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'validation');
                    expect(err).to.have.property('message', 'Authorization scheme invalid');
                    done();
                });
            });

            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not fetch any data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
        describe('invalid auth credentials', () => {
            beforeEach((done) => {
                env.authorization.credentials = '';
                env.oauth2.authorize(env.authorization)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'validation');
                    expect(err).to.have.property('message', 'Authorization credentials missing');
                    done();
                });
            });

            it('should not create the respositories', () => {
                expect(env.respository).to.not.have.been.called;
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not fetch any data', () => {
                expect(env.repo.select).to.not.have.been.called;
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
        describe('token not found', () => {
            beforeEach((done) => {
                env.repo.select.returns(Promise.accept([]));
                env.oauth2.authorize(env.authorization)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'process');
                    expect(err).to.have.property('message', 'Token not found');
                    done();
                });
            });

            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the tokens respository', () => {
                expect(env.respository).to.have.been.calledWith('tokens');
            });
            it('should retrieve the token', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({type: 'access', token: env.authorization.credentials});
            });
            it('should not create the user respository', () => {
                expect(env.respository).to.not.have.been.calledWith('users');
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.calledWith({userid: env.token.userid});
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
        describe('token expired', () => {
            beforeEach((done) => {
                env.token.expires = nowPlusMins(-60);
                env.repo.select.returns(Promise.accept([env.token]));
                env.oauth2.authorize(env.authorization)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'process');
                    expect(err).to.have.property('message', 'Token expired');
                    done();
                });
            });

            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledOnce;
            });
            it('should create the tokens respository', () => {
                expect(env.respository).to.have.been.calledWith('tokens');
            });
            it('should retrieve the token', () => {
                expect(env.repo.select).to.have.been.calledOnce;
                expect(env.repo.select).to.have.been.calledWith({type: 'access', token: env.authorization.credentials});
            });
            it('should not create the user respository', () => {
                expect(env.respository).to.not.have.been.calledWith('users');
            });
            it('should not fetch the user', () => {
                expect(env.repo.select).to.not.have.been.calledWith({userid: env.token.userid});
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
        describe('user not found', () => {
            beforeEach((done) => {
                env.repo.select.onFirstCall().returns(Promise.accept([env.token]));
                env.repo.select.onSecondCall().returns(Promise.accept([]));

                env.oauth2.authorize(env.authorization)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'process');
                    expect(err).to.have.property('message', 'User not found');
                    done();
                });
            });

            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should create the tokens respository', () => {
                expect(env.respository).to.have.been.calledWith('tokens');
            });
            it('should retrieve the token', () => {
                expect(env.repo.select).to.have.been.calledWith({type: 'access', token: env.authorization.credentials});
            });
            it('should create the user respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: env.token.userid});
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
        describe('user inactive', () => {
            beforeEach((done) => {
                env.user.status = 'Inactive';
                env.repo.select.onFirstCall().returns(Promise.accept([env.token]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.user]));

                env.oauth2.authorize(env.authorization)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'process');
                    expect(err).to.have.property('message', 'Account is inactive');
                    done();
                });
            });

            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should create the tokens respository', () => {
                expect(env.respository).to.have.been.calledWith('tokens');
            });
            it('should retrieve the token', () => {
                expect(env.repo.select).to.have.been.calledWith({type: 'access', token: env.authorization.credentials});
            });
            it('should create the user respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: env.token.userid});
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
        describe('user locked', () => {
            beforeEach((done) => {
                env.user.status = 'Locked';
                env.repo.select.onFirstCall().returns(Promise.accept([env.token]));
                env.repo.select.onSecondCall().returns(Promise.accept([env.user]));

                env.oauth2.authorize(env.authorization)
                .then(() => {
                    done('should not succeed');
                })
                .catch((err) => {
                    expect(err).to.have.property('type', 'process');
                    expect(err).to.have.property('message', 'Account is locked');
                    done();
                });
            });

            it('should create the respositories', () => {
                expect(env.respository).to.have.been.calledTwice;
                expect(env.repo.select).to.have.been.calledTwice;
            });
            it('should create the tokens respository', () => {
                expect(env.respository).to.have.been.calledWith('tokens');
            });
            it('should retrieve the token', () => {
                expect(env.repo.select).to.have.been.calledWith({type: 'access', token: env.authorization.credentials});
            });
            it('should create the user respository', () => {
                expect(env.respository).to.have.been.calledWith('users');
            });
            it('should fetch the user', () => {
                expect(env.repo.select).to.have.been.calledWith({userid: env.token.userid});
            });
            it('should not return the user', () => {
                expect(env.result).to.not.exist;
            });
        });
    });
});
