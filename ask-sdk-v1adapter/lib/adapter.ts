/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {
    createAskSdkError,
    DefaultApiClient,
    DynamoDbPersistenceAdapter,
    RequestHandler,
    SkillBuilders,
} from 'ask-sdk';
import {
    RequestEnvelope,
    Response,
    ResponseEnvelope,
} from 'ask-sdk-model';
import { DynamoDB } from 'aws-sdk';
import { EventEmitter } from 'events';
import * as i18n from 'i18next';
import * as sprintf from 'i18next-sprintf-postprocessor';
import { CopySessionAttributesInterceptor } from './copySessionAttributesInterceptor';
import { SkillEventHandlers } from './defaultHandlers/skillEventHandlers';
import { Handler } from './handler';
import { ResponseBuilder } from './responseBuilderShim';
import { ResponseHandlers } from './responseHandlers';
import { V1Handler } from './v1Handler';

export class Adapter extends EventEmitter {
    public readonly _event : RequestEnvelope;
    public readonly _context : any;
    public readonly _callback : (err : Error, result? : any) => void;
    public state : string;
    public appId : string;
    public response : ResponseEnvelope;
    public dynamoDBClient : DynamoDB;
    public dynamoDBTableName : string;
    public saveBeforeResponse : boolean;
    public i18n : i18n;
    public locale : string;
    public resources : object;
    public promiseResolve : (value? : Response | PromiseLike<Response>) => void;
    private v2RequestHandlers : RequestHandler[];

    constructor(event : RequestEnvelope, context : any, callback? : (err : Error, result? : any) => void) {
        super();

        if (!event.session) {
            event.session = {
                new : undefined,
                sessionId : undefined,
                user : undefined,
                application : undefined,
                attributes : {},
            };
        } else if (!event.session.attributes) {
            event.session.attributes = {};
        }

        this.setMaxListeners(Infinity);

        this._event = event;
        this._context = context;
        this._callback = callback;
        this.response = {
            version : '1.0',
            response : {},
        };
        this.dynamoDBClient = new DynamoDB({
            apiVersion: 'latest',
        });
        this.saveBeforeResponse = false;
        this.v2RequestHandlers = [];
        this.i18n = i18n;
        this.registerHandlers(SkillEventHandlers);
        this.registerHandlers(ResponseHandlers);
    }

    public registerHandlers(...v1Handlers : V1Handler[]) : void {
        for ( const handler of v1Handlers) {
            if (!IsObject(handler)) {
                throw createAskSdkError(this.constructor.name, `Argument #${handler.constructor.name} was not an Object`);
            }
            const eventNames = Object.keys(handler);
            for (const eventName of eventNames) {
                if (typeof(handler[eventName]) !== 'function') {
                    throw createAskSdkError(this.constructor.name, `Event handler for '${eventName}' was not a function`);
                }

                let targetEventName = eventName;

                if (handler[StateString as any]) {
                    targetEventName += handler[StateString as any];
                }

                const handlerContext = {
                    on: this.on.bind(this),
                    emit: this.emit.bind(this),
                    emitWithState: EmitWithState.bind(this),
                    handler: this,
                    i18n: this.i18n,
                    locale: this.locale,
                    t : (...argArray : string[]) : string => {
                        return this.i18n.t.apply(this.i18n, argArray);
                    },
                    event: this._event,
                    attributes : this._event.session.attributes,
                    context: this._context,
                    callback : this._callback,
                    name: targetEventName,
                    isOverridden:  IsOverridden.bind(this, targetEventName),
                    response: new ResponseBuilder(this),
                };
                this.on(targetEventName, handler[eventName].bind(handlerContext));
            }
        }
    }

    public registerV2Handlers(...requestHandlers : RequestHandler[]) : void {
        this.v2RequestHandlers = [...this.v2RequestHandlers, ...requestHandlers];
    }

    public execute() : void {
        // tslint:disable-next-line
        this.locale = this._event.request['locale'] ? this._event.request['locale'] : 'en-US';
        if (this.resources) {
            this.i18n.use(sprintf).init({
                lng : this.locale,
                overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
                resources : this.resources,
                returnObjects : true,
            },                          (err) => {
                if (err) {
                    throw createAskSdkError(this.constructor.name, 'Error initializing i19next: ' + err);
                }
                ValidateRequest.call(this);
            });
        } else {
            ValidateRequest.call(this);
        }
    }
}

export const StateString = Symbol('StateString');

export function CreateStateHandler(state : string, requestHandler : V1Handler) : V1Handler {
    if (!requestHandler) {
        requestHandler = {};
    }

    Object.defineProperty(requestHandler, StateString, {
        value : state || '',
        enumerable : false,
    });

    return requestHandler;
}

let dynamoDbPersistenceAdapter : DynamoDbPersistenceAdapter;

/* tslint:disable */
function ValidateRequest() : void {
    let requestAppId = '';
    if (this._event.context) {
        requestAppId = this._event.context.System.application.applicationId;
    } else if (this._event.session) {
        requestAppId = this._event.session.application.applicationId;
    }

    if (!this.appId) {
        console.log('Warning: Application ID is not set');
    }
    try {
        if (this.appId && (requestAppId !== this.appId)) {
            console.log(`The applicationIds don\'t match: ${requestAppId} and ${this.appId}`);
            const error = createAskSdkError('In validating request', 'Invalid ApplicationId: ' + this.appId);
            if (typeof this.callback === 'undefined') {
                this._context.fail(error);
            } else {
                this._callback(error);
            }
        }

        if (this.dynamoDBTableName && (!this._event.session.sessionId || this._event.session.new)) {
            if (!dynamoDbPersistenceAdapter) {
                dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({
                    createTable : true,
                    dynamoDBClient : this.dynamoDBClient,
                    partitionKeyName : 'userId',
                    attributesName : 'mapAttr',
                    tableName : this.dynamoDBTableName,
                });
            }

            dynamoDbPersistenceAdapter.getAttributes(this._event)
                .then((data) => {
                    Object.assign(this._event.session.attributes, data);
                    EmitEvent.call(this);
                })
                .catch((error) => {
                    const err = createAskSdkError(this.constructor.name, 'Error fetching user state: ' + error);
                    if (typeof this._callback === 'undefined') {
                        return this._context.fail(err);
                    } else {
                        return this._callback(err);
                    }
                });
        } else {
            EmitEvent.call(this);
        }
    } catch (e) {
        console.log(`Unexpected exception '${e}':\n${e.stack}`);
        if (typeof this._callback === 'undefined') {
            return this._context.fail(e);
        } else {
            return  this._callback(e);
        }
    }
}

function EmitEvent() : void {
    const packageInfo = require('../package.json');
    this.state = this._event.session.attributes.STATE || '';

    SkillBuilders.custom()
                 .addRequestHandlers(new Handler(this), ...this.v2RequestHandlers)
                 .addRequestInterceptors(new CopySessionAttributesInterceptor())
                 .withPersistenceAdapter(dynamoDbPersistenceAdapter)
                 .withApiClient(new DefaultApiClient())
                 .withCustomUserAgent(`${packageInfo.name}/${packageInfo.version}`)
                 .create()
                 .invoke(this._event, this._context)
                 .then((responseEnvelope) => {
                    if (typeof this._callback === 'undefined') {
                        this._context.succeed(responseEnvelope);
                    } else {
                        this._callback(null, responseEnvelope);
                    }
                })
                 .catch((err) => {
                    if (typeof this._callback === 'undefined') {
                        this._context.fail(err);
                    } else {
                        this._callback(err);
                    }
                });
}

function EmitWithState() : void {
    if (arguments.length === 0) {
        throw createAskSdkError(this.constructor.name, 'EmitWithState called without arguments');
    }
    arguments[0] = arguments[0] + this.state;

    if (this.listenerCount(arguments[0]) < 1) {
        arguments[0] = 'Unhandled' + this.state;
    }

    if (this.listenerCount(arguments[0]) < 1) {
        throw createAskSdkError(this.constructor.name, `No 'Unhandled' function defined for event: ${arguments[0]}`);
    }

    this.emit.apply(this, arguments);
}

function IsOverridden(name : string) : boolean {
    return this.listenerCount(name) > 1;
}

function IsObject(obj : any) : boolean {
    return (!!obj) && (obj.constructor === Object);
}

process.on('uncaughtException', function(err) {
    console.log(`Uncaught exception: ${err}\n${err.stack}`);
    throw err;
});
