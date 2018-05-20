'use strict';

class ServiceError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = 'ServiceError';
        this.statusCode = statusCode;
        Error.captureStackTrace(this, ServiceError);
    }
}

module.exports.ServiceError = ServiceError;