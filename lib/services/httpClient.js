'use strict';

const https = require('https');
const http = require('http');
const url = require('url');

const HTTPS_PROTOCOL = 'https:';

class HttpRequest {
    constructor(uri, method) {
        const obj = url.parse(uri);
        this.protocol = obj.protocol;
        this.path = obj.path;
        this.port = obj.port || (obj.protocol === HTTPS_PROTOCOL ? 443 : 80);
        this.host = obj.host;
        this.method = method;
        this.headers = {};
    }

    headers(obj) {
        this.headers = obj;
        return this;
    }

    body(obj) {
        this.body = obj;
        return this;
    }

    send() {
        return new Promise((resolve, reject) => {
            const options = {
                protocol : this.protocol,
                host : this.host,
                port : this.port,
                method : this.method,
                headers : this.headers
            };

            const protocol = this.protocol === HTTPS_PROTOCOL ? https : http;
            protocol.request(options, (response) => {
                const chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                response.on('end', () => {
                    const responseStr = chunks.join('');
                    const responseObj = {
                        statusCode : response.statusCode,
                        statusText : response.statusText,
                        body : responseStr,
                        headers : response.headers
                    };

                    resolve(responseObj);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }
}

class HttpClient {
    /**
     * @static
     * @param {string} url
     * @returns {HttpRequest}
     * @memberof HttpClient
     */
    static post(url) {
        return new HttpRequest(url, 'POST');
    }

    /**
     * @static
     * @param {string} url
     * @returns {HttpRequest}
     * @memberof HttpClient
     */
    static get(url) {
        return new HttpRequest(url, 'GET');
    }
}

module.exports = HttpClient;