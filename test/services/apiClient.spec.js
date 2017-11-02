'use strict';

const ApiClient = require('../../lib/services/apiClient').ApiClient;
const nock = require('nock');
const expect = require('chai').expect;

const url = 'http://dummy';

describe('APIClient', () => {
    it('should form POST request with passed headers, body and uri', () => {
        const apiClient = new ApiClient();
        const body = 'body';

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .post('/', body)
            .reply(200, 'SUCCESS');

        return apiClient.post(url, {authorization: 'AUTH'}, body)
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should form GET request with passed headers and uri', () => {
        const apiClient = new ApiClient();

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .get('/')
            .reply(200, 'SUCCESS');

        return apiClient.get(url, {authorization: 'AUTH'})
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should form DELETE request with passed headers and uri', () => {
        const apiClient = new ApiClient();

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .delete('/')
            .reply(200, 'SUCCESS');

        return apiClient.delete(url, {authorization: 'AUTH'})
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should form PUT request with passed headers, body and uri', () => {
        const apiClient = new ApiClient();
        const body = 'body';

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .put('/', body)
            .reply(200, 'SUCCESS');

        return apiClient.put(url, {authorization: 'AUTH'}, body)
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should reject the call if an error is thrown by api', () => {
        const apiClient = new ApiClient();
        const body = 'body';

        nock(url).post('/', body)
            .replyWithError('ERROR');

        return apiClient.post(url, {authorization: 'AUTH'}, body)
            .then(() =>  {
                expect.fail(null, null, 'Resolved promise when it should rejected it');
            })
            .catch((err) => {
                expect(err.message).to.equal('ERROR');
            });
    });
});