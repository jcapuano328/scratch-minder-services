'use strict';
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sandbox = require('sandboxed-module')
chai.use(require('sinon-chai'));

describe('Next in Sequence', () => {
	var env = {};

	beforeEach(() => {
		env = {};
        env.nextSequence = sandbox.require('../../src/lib/next-sequence');
    });

    describe('integer', () => {
        beforeEach(() => {
			env.sequence = env.nextSequence(12345);
        });
        it('should increment the sequence', () => {
            expect(env.sequence).to.equal(12346);
        });
    });

	describe('valid numeric string', () => {
        beforeEach(() => {
			env.sequence = env.nextSequence('12345');
        });
        it('should increment the sequence', () => {
            expect(env.sequence).to.equal(12346);
        });
    });

	describe('invalid numeric string', () => {
        beforeEach(() => {
			env.sequence = env.nextSequence('12a345');
        });
        it('should increment the sequence', () => {
            expect(env.sequence).to.equal(13);
        });
    });

	describe('non numeric string', () => {
        beforeEach(() => {
			env.sequence = env.nextSequence('this is a sequence');
        });
        it('should reset the sequence', () => {
            expect(env.sequence).to.equal(1);
        });
    });
});
