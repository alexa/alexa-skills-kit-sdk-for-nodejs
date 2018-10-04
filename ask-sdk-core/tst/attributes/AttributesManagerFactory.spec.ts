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

import { expect } from 'chai';
import { AttributesManagerFactory } from '../../lib/attributes/AttributesManagerFactory';
import { JsonProvider } from '../mocks/JsonProvider';
import { MockPersistenceAdapter } from '../mocks/persistence/MockPersistenceAdapter';

describe('AttributesManagerFactory', () => {
    it('should throw an error when RequestEnvelope is null or undefined', () => {
        try {
            AttributesManagerFactory.init({requestEnvelope : null});
        } catch (error) {
            expect(error.name).eq('AskSdk.AttributesManagerFactory Error');
            expect(error.message).eq('RequestEnvelope cannot be null or undefined!');

            return;
        }

        throw new Error('should have thrown an error');
    });

    it('should be able to get session attributes from in session request envelope', () => {

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.session.attributes = {mockKey : 'mockValue'};

        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        expect(defaultAttributesManager.getSessionAttributes()).deep.equal({mockKey : 'mockValue'});
    });

    it('should be able to get default session attributes from new session request envelope', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        expect(defaultAttributesManager.getSessionAttributes()).deep.equal({});
    });

    it('should throw an error when trying to get session attributes from out of session request envelope', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.session = undefined;
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        try {
            defaultAttributesManager.getSessionAttributes();
        } catch (err) {
            expect(err.name).equal('AskSdk.AttributesManager Error');
            expect(err.message).equal('Cannot get SessionAttributes from out of session request!');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to get persistent attributes', async() => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({
            persistenceAdapter : new MockPersistenceAdapter(),
            requestEnvelope,
        });

        expect(await defaultAttributesManager.getPersistentAttributes()).deep.equal({
            key_1 : 'v1',
            key_2 : 'v2',
            state : 'mockState',
        });
    });

    it('should throw an error when trying to get persistent attributes without persistence manager', async() => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        try {
            await defaultAttributesManager.getPersistentAttributes();
        } catch (err) {
            expect(err.name).equal('AskSdk.AttributesManager Error');
            expect(err.message).equal('Cannot get PersistentAttributes without PersistenceManager');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to get initial request attributes', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        expect(defaultAttributesManager.getRequestAttributes()).deep.equal({});
    });

    it('should be able to set session attributes', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.session.attributes = {mockKey : 'mockValue'};
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        expect(defaultAttributesManager.getSessionAttributes()).deep.equal({mockKey : 'mockValue'});

        defaultAttributesManager.setSessionAttributes({updatedKey : 'UpdatedValue'});

        expect(defaultAttributesManager.getSessionAttributes()).deep.equal({updatedKey : 'UpdatedValue'});
    });

    it('should throw an error when trying to set session attributes to out of session request envelope', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.session = undefined;
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        try {
            defaultAttributesManager.setSessionAttributes({key : 'value'});
        } catch (err) {
            expect(err.name).equal('AskSdk.AttributesManager Error');
            expect(err.message).equal('Cannot set SessionAttributes to out of session request!');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to set persistent attributes', async() => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({
            persistenceAdapter : new MockPersistenceAdapter(),
            requestEnvelope,
        });

        defaultAttributesManager.setPersistentAttributes({key : 'value'});

        expect(await defaultAttributesManager.getPersistentAttributes()).deep.equal({key : 'value'});
    });

    it('should throw an error when trying to set persistent attributes without persistence manager', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        try {
            defaultAttributesManager.setPersistentAttributes({key : 'value'});
        } catch (err) {
            expect(err.name).equal('AskSdk.AttributesManager Error');
            expect(err.message).equal('Cannot set PersistentAttributes without persistence adapter!');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to set request attributes', async() => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        defaultAttributesManager.setRequestAttributes({key : 'value'});

        expect(defaultAttributesManager.getRequestAttributes()).deep.equal({key : 'value'});
    });

    it('should be able to savePersistentAttributes persistent attributes to persistence layer', async() => {
        const mockPersistenceAdapter = new MockPersistenceAdapter();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({
            persistenceAdapter : mockPersistenceAdapter,
            requestEnvelope,
        });

        defaultAttributesManager.setPersistentAttributes({mockKey : 'mockValue'});

        await defaultAttributesManager.savePersistentAttributes();

        expect(await mockPersistenceAdapter.getAttributes(requestEnvelope)).deep.equal({mockKey : 'mockValue'});

    });

    it('should thrown an error when trying to save persistent attributes without persistence manager', async() => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({requestEnvelope});

        try {
            await defaultAttributesManager.savePersistentAttributes();
        } catch (err) {
            expect(err.name).equal('AskSdk.AttributesManager Error');
            expect(err.message).equal('Cannot save PersistentAttributes without persistence adapter!');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should should do nothing if persistentAttributes has not been changed', async() => {
        const mockPersistenceAdapter = new MockPersistenceAdapter();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({
            persistenceAdapter : mockPersistenceAdapter,
            requestEnvelope,
        });

        await defaultAttributesManager.savePersistentAttributes();

        expect(await mockPersistenceAdapter.getAttributes(requestEnvelope)).deep.equal({
            key_1 : 'v1',
            key_2 : 'v2',
            state : 'mockState',
        });
        expect(mockPersistenceAdapter.getCounter).equal(1);
        expect(mockPersistenceAdapter.saveCounter).equal(0);
    });

    it('should make only 1 getAttributes call during multiple getPersistentAttributes', async() => {
        const mockPersistenceAdapter = new MockPersistenceAdapter();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({
            persistenceAdapter : mockPersistenceAdapter,
            requestEnvelope,
        });

        await defaultAttributesManager.getPersistentAttributes();
        await defaultAttributesManager.getPersistentAttributes();
        await defaultAttributesManager.getPersistentAttributes();
        await defaultAttributesManager.getPersistentAttributes();
        expect(mockPersistenceAdapter.getCounter).equal(1);
        expect(mockPersistenceAdapter.saveCounter).equal(0);
    });

    it('should not make saveAttributes call until savePersistentAttributes is called', async() => {
        const mockPersistenceAdapter = new MockPersistenceAdapter();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        const defaultAttributesManager = AttributesManagerFactory.init({
            persistenceAdapter : mockPersistenceAdapter,
            requestEnvelope,
        });

        await defaultAttributesManager.setPersistentAttributes({});
        await defaultAttributesManager.setPersistentAttributes({});
        await defaultAttributesManager.setPersistentAttributes({});
        await defaultAttributesManager.setPersistentAttributes({});
        expect(mockPersistenceAdapter.getCounter).equal(0);
        expect(mockPersistenceAdapter.saveCounter).equal(0);
        await defaultAttributesManager.savePersistentAttributes();
        expect(mockPersistenceAdapter.saveCounter).equal(1);
    });
});
