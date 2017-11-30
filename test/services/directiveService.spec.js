'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

const DirectiveService = require('../../lib/services/directiveService');

const testEndpoint = 'http://dummy';
const testToken = 'token';

describe('DirectiveService', () => {
    it('should call /v1/directives API', () => {
        //Set up
        const directive = {};
        const fakeApiResult = { statusCode: 200, body: '' };
        const apiStub = { post : () => Promise.resolve(fakeApiResult) };
        const spy = sinon.spy(apiStub, 'post');

        //Test
        const ds = new DirectiveService(apiStub);
        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect(spy.callCount).to.equal(1);
            });
    });

    it('should not reject promise on error', () => {
        //Set up
        const directive = {};
        const errMsg = 'error';
        const apiStub = { post : () => Promise.reject(new Error(errMsg)) };

        //Test
        const ds = new DirectiveService(apiStub);
        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect.fail('should have thrown exception');
            })
            .catch((err) => {
                expect(err.message).to.equal(errMsg);
            });
    });

    it('should reject the promise with the error message if the API client returns a non 2xx status', () => {
        //Set up
        const directive = { };
        const expectedMessage = 'Invalid Directive';
        const fakeApiResult = { statusCode: 400, body: `${expectedMessage}` };
        const apiStub = { post: () =>  Promise.resolve(fakeApiResult) };

        //Test
        const ds = new DirectiveService(apiStub);
        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect.fail('should have rejected the promise');
            })
            .catch((err) => {
                expect(err.statusCode).to.equal(400);
                expect(err.message).to.equal(JSON.stringify(expectedMessage));
            });
    });

    it('should not expose any implementation details on the returning promise', () => {
        //Set up
        const directive = {};
        const fakeApiResult = { statusCode: 200, body: '' };
        const apiStub = { post : () => Promise.resolve(fakeApiResult) };

        //Test
        const ds = new DirectiveService(apiStub);
        return ds.enqueue(directive, testEndpoint, testToken)
            .then((result) => {
                expect(result).to.be.undefined;
            });
    });
});