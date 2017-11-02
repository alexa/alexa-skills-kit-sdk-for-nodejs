'use strict';

const expect = require('chai').expect;
const ServiceError = require('../../lib/services/serviceError').ServiceError;

function throwServiceError() {
    throw new ServiceError(202, 'Error Message');
}

describe('ServiceError', () => {
    it('should create a ServiceError with statusCode and message', () => {
        try{
            throwServiceError();
        } catch(error) {
            expect(error.statusCode).to.equal(202);
            expect(error.message).to.equal('Error Message');
            expect(error).to.be.an.instanceOf(Error);
            expect(require('util').isError(error)).to.equal(true);
            expect(error.stack.split('\n')[0]).to.deep.equal('ServiceError: Error Message');
            expect(error.stack.split('\n')[1].indexOf('throwServiceError')).to.deep.equal(7);
        }
    });
});
