'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module');
chai.use(require('sinon-chai'));

describe('Password Services', () => {
	var env = {};
	beforeEach(() => {
		env = {};
		env.crypto = require('easy-pbkdf2')();
		sinon.spy(env.crypto, 'secureHash');
		sinon.spy(env.crypto, 'verify');

        env.passwordSvc = sandbox.require('../../src/lib/password', {
			requires: {
				'easy-pbkdf2': sinon.stub().returns(env.crypto)
			}
		});

		env.password = 'go';
		env.salt = 'salt';
		env.hash = 'qWU5llQDKUNt1pziXcefjEujHyXFHEgES4wO2r0guprWHFaFA2qNk9EbUtb4gAuh4XT2h+6Sltujt8UD7ZiizsVmcpR5aWuZwBW+WfH/wsbPurr2Ls1I1LJTYOmQo9gEznhO7vjT64/BVlDgsvm3xgHyzUffwg5bt728YmObrohsHx3M0PR1ZjuKmvG4tdLBeTAjjLMxg1cIyY96WQB/NYTmAZ/Ln54JVZHdHj6jw/MuaLha/JxfHlCkDe2ISw15u8eVS0esvcJy/0Fuob8+4wpMcIkGPEG1bzOXlY7kG7ZuHb7gjZ4d2e/mkIARjVfToZx4jGF89WuQOBA4Wrc8qA==';
    });

    describe('interface', () => {
        it('should have a generate handler', () => {
            expect(env.passwordSvc).to.respondTo('generate');
        });
		it('should have a verify handler', () => {
            expect(env.passwordSvc).to.respondTo('verify');
        });
    });
    describe('generate', () => {
        beforeEach(() => {
			env.crypto.generateSalt = sinon.stub().returns(env.salt);
        });
        describe('success', () => {
            beforeEach((done) => {
                env.passwordSvc.generate(env.password)
                .then((result) => {
					env.result = result;
					done();
				})
                .catch(done);
            });
            it('should generate the salt', () => {
                expect(env.crypto.generateSalt).to.have.been.calledOnce;
            });
            it('should hash the password', () => {
                expect(env.crypto.secureHash).to.have.been.calledOnce;
                expect(env.crypto.secureHash).to.have.been.calledWith(env.password, env.salt, sinon.match.func);
            });
            it('should return hash/salt', () => {
                expect(env.result).to.exist;
				expect(env.result).to.have.property('salt', env.salt);
				expect(env.result).to.have.property('hash', env.hash);
            });
        });

        describe('failure', () => {
			beforeEach((done) => {
				env.crypto.secureHash = sinon.stub().yields('bad things, man');

                env.passwordSvc.generate(env.password)
                .then(() => {
					done('should not succeed');
				})
                .catch((err) => {
					expect(err).to.equal('bad things, man');
					done();
				});
            });
            it('should generate the salt', () => {
                expect(env.crypto.generateSalt).to.have.been.calledOnce;
            });
            it('should hash the password', () => {
                expect(env.crypto.secureHash).to.have.been.calledOnce;
                expect(env.crypto.secureHash).to.have.been.calledWith(env.password, env.salt, sinon.match.func);
            });
        });
    });


	describe('verify', () => {
        describe('success', () => {
            beforeEach((done) => {
                env.passwordSvc.verify(env.password,env.salt,env.hash)
                .then((result) => {
					env.result = result;
					done();
				})
                .catch(done);
            });
            it('should verify the password', () => {
                expect(env.crypto.verify).to.have.been.calledOnce;
                expect(env.crypto.verify).to.have.been.calledWith(env.salt, env.hash, env.password, sinon.match.func);
            });
            it('should return valid', () => {
                expect(env.result).to.be.true;
            });
        });

        describe('failure', () => {
            beforeEach((done) => {
				env.salt = 'fubar';
				env.passwordSvc.verify(env.password,env.salt,env.hash)
                .then((result) => {
					env.result = result;
					done();
				})
                .catch(done);
            });
			it('should verify the password', () => {
                expect(env.crypto.verify).to.have.been.calledOnce;
                expect(env.crypto.verify).to.have.been.calledWith(env.salt, env.hash, env.password, sinon.match.func);
            });
			it('should return invalid', () => {
                expect(env.result).to.be.false;
            });
        });

		describe('error', () => {
            beforeEach((done) => {
				env.crypto.verify = sinon.stub().yields('bad things, man');

				env.passwordSvc.verify(env.password,env.salt,env.hash)
				.then(() => {
					done('should not succeed');
				})
                .catch((err) => {
					env.err = err;
					done();
				});
            });
			it('should verify the password', () => {
                expect(env.crypto.verify).to.have.been.calledOnce;
                expect(env.crypto.verify).to.have.been.calledWith(env.salt, env.hash, env.password, sinon.match.func);
            });
			it('should return error', () => {
				expect(env.err).to.equal('bad things, man');                
            });
        });
    });
});
