'use strict';
var chai = require('chai'),
    expect = chai.expect,
	sinon = require('sinon'),
    sandbox = require('sandboxed-module'),
    _ = require('lodash');
chai.use(require('sinon-chai'));

describe('log service', () => {
	var env = {};
    beforeEach(() => {
    	env.config = {
        	log: {
            	server: {
                }
            }
        };
        env.console = {
        	log: sinon.stub()
        };
        env.colors = {
        	setTheme: sinon.stub(),
        	trace: sinon.stub(),
        	debug: sinon.stub(),
        	info: sinon.stub(),
        	warn: sinon.stub(),
        	error: sinon.stub(),
        	fatal: sinon.stub()
        };
        env.colors.trace.returnsArg(0);
        env.colors.debug.returnsArg(0);
        env.colors.info.returnsArg(0);
        env.colors.warn.returnsArg(0);
        env.colors.error.returnsArg(0);
        env.colors.fatal.returnsArg(0);

		env.logger = sandbox.require('../../src/lib/log.js', {
        	requires : {
				'config': env.config,
                'colors': env.colors,
				'./console': env.console,
                'lodash': _
			}
		});
    });

    describe('logger', () => {
    	describe('settings', () => {
	    	describe('default', () => {
	        	beforeEach(() => {
	                env.log = env.logger;
	            });
	            it('should have the proper levels set', () => {
	            	expect(env.log).to.respondTo('trace');
	            	expect(env.log).to.respondTo('debug');
	            	expect(env.log).to.respondTo('info');
	            	expect(env.log).to.respondTo('warn');
	            	expect(env.log).to.respondTo('error');
	            	expect(env.log).to.respondTo('fatal');
	            });
	        });

	    	describe('custom', () => {
	    		describe('levels', () => {
		        	beforeEach(() => {
	                	env.config.log.server.levels = ['foo', 'bar', 'wth'];
						env.logger = sandbox.require('../../src/lib/log.js', {
				        	requires : {
								'config': env.config,
								'colors': env.colors,
								'./console': env.console,
                                'lodash': _
							}
						});

	                    env.log = env.logger;
		            });
	                it('should have the proper levels set', () => {
	                	expect(env.log).to.respondTo('foo');
	                	expect(env.log).to.respondTo('bar');
	                	expect(env.log).to.respondTo('wth');

	                	expect(env.log).to.not.respondTo('trace');
	                	expect(env.log).to.not.respondTo('debug');
	                	expect(env.log).to.not.respondTo('info');
	                	expect(env.log).to.not.respondTo('warn');
	                	expect(env.log).to.not.respondTo('error');
	                	expect(env.log).to.not.respondTo('fatal');
	                });
	            });
	        });
		});
    });

    describe('getExpressFormat', () => {
        describe('default', () => {
        	beforeEach(() => {
            	env.format = env.logger.getExpressFormat();
            });
            it('should return default format', () => {
            	expect(env.format).to.equal(':remote-addr - - [:date] ":method :url HTTP/:http-version" (:status) :res[content-length] ":referrer" ":user-agent"');
            });
        });

        describe('custom', () => {
        	beforeEach(() => {
            	env.config.log.server.expressFormat = 'dev';
				env.logger = sandbox.require('../../src/lib/log.js', {
		        	requires : {
						'config': env.config,
                        'colors': env.colors,
						'./console': env.console,
                        'lodash': _
					}
				});

            	env.format = env.logger.getExpressFormat();
            });
            it('should return custom format', () => {
            	expect(env.format).to.equal('dev');
            });
        });

    });


    describe('logging', () => {
        describe('enabled', () => {
        	beforeEach(() => {
            	env.log = env.logger;
                env.log.info('foo');
            });
            it('should log the message', () => {
            	expect(env.console.log).to.have.been.calledOnce;
            });
        });

        describe('disabled', () => {
        	beforeEach(() => {
            	env.config.log.server.transports = {
			      	console: {
                        enabled: false
			        }
                };
				env.logger = sandbox.require('../../src/lib/log.js', {
		        	requires : {
						'config': env.config,
                        'colors': env.colors,
						'./console': env.console,
                        'lodash': _
					}
				});

            	env.log = env.logger;
                env.log.info('foo');
            });
            it('should not log the message', () => {
            	expect(env.console.log).to.not.have.been.called;
            });
        });

        describe('levels', () => {
	        describe('debug @ info', () => {
	        	beforeEach(() => {
	            	env.config.log.server.transports = {
				      	console: {
	                        level: 'info'
				        }
	                };
					env.logger = sandbox.require('../../src/lib/log.js', {
			        	requires : {
							'config': env.config,
                            'colors': env.colors,
							'./console': env.console,
                            'lodash': _
						}
					});

	            	env.log = env.logger;
	                env.log.debug('foo');
	            });
	            it('should not log the message', () => {
	            	expect(env.console.log).to.not.have.been.called;
	            });
	        });

	        describe('warn @ info', () => {
	        	beforeEach(() => {
	            	env.config.log.server.transports = {
				      	console: {
	                        level: 'info'
				        }
	                };
					env.logger = sandbox.require('../../src/lib/log.js', {
			        	requires : {
							'config': env.config,
                            'colors': env.colors,
							'./console': env.console,
                            'lodash': _
						}
					});

	            	env.log = env.logger;
	                env.log.warn('foo');
	            });
	            it('should log the message', () => {
	            	expect(env.console.log).to.have.been.calledOnce;
	            });
	        });
        });

        describe('text', () => {
        	describe('no context', () => {
	        	beforeEach(() => {
	            	env.config.log.server.transports = {
				      	console: {
	                        format: ['level', 'message', 'user', 'platform']
				        }
	                };
					env.logger = sandbox.require('../../src/lib/log.js', {
			        	requires : {
							'config': env.config,
                            'colors': env.colors,
							'./console': env.console,
                            'lodash': _
						}
					});

	                env.log = env.logger;
	                env.log.warn('foo');
	            });

	            it('should format the message as text', () => {
	            	expect(env.colors.warn).to.have.been.calledOnce;
	            	expect(env.colors.warn).to.have.been.calledWith('warn ');

	            	expect(env.console.log).to.have.been.calledWith('warn  - foo - foo');
	            });
            });

        	describe('context', () => {
	        	beforeEach(() => {
	            	env.config.log.server.transports = {
				      	console: {
	                        format: ['level', 'message', 'user', 'platform']
				        }
	                };
					env.logger = sandbox.require('../../src/lib/log.js', {
			        	requires : {
							'config': env.config,
                            'colors': env.colors,
							'./console': env.console,
                            'lodash': _
						}
					});

	                env.log = env.logger;
	            });

	        	describe('args', () => {
		        	beforeEach(() => {
		                env.log.warn('foo', 'mook', 'desktop');
		            });

		            it('should format the message as text', () => {
	            		expect(env.colors.warn).to.have.been.calledOnce;
		            	expect(env.colors.warn).to.have.been.calledWith('warn ');

		            	expect(env.console.log).to.have.been.calledWith('warn  - foo - foo - mook');//('warn  - foo - mook - desktop');
		            });
	            });

	        	describe('object', () => {
		        	beforeEach(() => {
		                env.log.warn('foo', {user: 'mook', platform: 'desktop'});
		            });

		            it('should format the message as text', () => {
	            		expect(env.colors.warn).to.have.been.calledOnce;
		            	expect(env.colors.warn).to.have.been.calledWith('warn ');

		            	expect(env.console.log).to.have.been.calledWith('warn  - foo - mook - desktop');
		            });
	            });
            });
        });

        describe('json', () => {
        	describe('no context', () => {
	        	beforeEach(() => {
	            	env.config.log.server.transports = {
				      	console: {
	                        format: ['level', 'message', 'user', 'platform'],
	                        json: true
				        }
	                };
					env.logger = sandbox.require('../../src/lib/log.js', {
			        	requires : {
							'config': env.config,
                            'colors': env.colors,
							'./console': env.console,
                            'lodash': _
						}
					});

	                env.log = env.logger;
	                env.log.warn('foo');
	            });

	            it('should format the message as json', () => {
	            	expect(env.colors.warn).to.have.been.calledOnce;
	            	expect(env.colors.warn).to.have.been.calledWith('warn');

	            	expect(env.console.log).to.have.been.calledWith(JSON.stringify({
	                	level: 'warn',
	                    message: 'foo',
	                    user: 'foo',
	                    platform: ''
	                }));
	            });
	        });

        	describe('context', () => {
	        	beforeEach(() => {
	            	env.config.log.server.transports = {
				      	console: {
	                        format: ['level', 'message', 'user', 'platform'],
	                        json: true
				        }
	                };
					env.logger = sandbox.require('../../src/lib/log.js', {
			        	requires : {
							'config': env.config,
                            'colors': env.colors,
							'./console': env.console,
                            'lodash': _
						}
					});

	                env.log = env.logger;
	            });

                describe('args', () => {
		        	beforeEach(() => {
		                env.log.warn('foo', 'mook', 'desktop');
		            });

		            it('should format the message as json', () => {
	            		expect(env.colors.warn).to.have.been.calledOnce;
		            	expect(env.colors.warn).to.have.been.calledWith('warn');
		            	expect(env.console.log).to.have.been.calledWith(JSON.stringify({
		                	level: 'warn',
		                    message: 'foo',
		                    user: 'foo',
		                    platform: 'mook'
		                }));
		            });
                });

                describe('object', () => {
		        	beforeEach(() => {
		                env.log.warn('foo', {user: 'mook', platform: 'desktop'});
		            });

		            it('should format the message as json', () => {
	            		expect(env.colors.warn).to.have.been.calledOnce;
		            	expect(env.colors.warn).to.have.been.calledWith('warn');

		            	expect(env.console.log).to.have.been.calledWith(JSON.stringify({
		                	level: 'warn',
		                    message: 'foo',
		                    user: 'mook',
		                    platform: 'desktop'
		                }));
		            });
                });
	        });
        });
    });
});
