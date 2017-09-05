'use strict';

const HttpClient = require('HttpClient');
const Url = require('url');
const DIRECTIVES_API_PATH = '/v1/directives';

class DirectiveService {

    /**
     * @param {DirectiveObject} directiveObj
     * @param {string} apiEndpoint
     * @param {string} token
     * @memberof DirectiveService
     */
    enqueue(directiveObj, apiEndpoint, token) {
        const url = new Url(DIRECTIVES_API_PATH, apiEndpoint);
        return this.__dispatch(directiveObj, url, token)
                   .catch((err) => {
                       console.error('error dispatching request to directive service: ' + err.message);
                   });
    }

    /**
     * Call the /v1/directives api with the specified bearer token and directive object
     *
     * @
     * @param {string} token valid oauth token from api.amazon.com/auth
     * @param {DirectiveObject} directiveObj
     * @private
     * @memberof DirectiveService
     */
    __dispatch(directiveObj, url, token) {
        const payload = JSON.stringify(directiveObj);
        return HttpClient.post(url)
                         .headers({ Authorization : `Bearer ${token}` })
                         .body(payload)
                         .send();
    }
}

module.exports.DirectiveService = DirectiveService;