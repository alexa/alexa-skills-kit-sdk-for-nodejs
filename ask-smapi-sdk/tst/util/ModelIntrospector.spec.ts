/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { ApiOperation, ApiParameter, CustomizationProcessor, ModelIntrospector, TypeDefinition } from '../../lib/util/ModelIntrospector';

describe('ModelIntrospector', () => {

    const mockModel = {
        paths: {
            '/v1/foo': {
                post: {
                    'x-operation-name': 'fooV1',
                    'description': 'foo',
                    'parameters': [ {
                        name: 'foo',
                        description: 'food desc',
                        required: true,
                        type: 'object',
                        schema: {
                            $ref: '#/definitions/Foo',
                        },
                    }],
                },
            },
        },
        definitions: {
            Foo: {
                type: 'object',
            },
        },
    };

    it('should be able to return a list of operations', () => {
        const introspector: ModelIntrospector = new ModelIntrospector(mockModel);
        const operations: Map<string, ApiOperation> = introspector.getOperations();
        expect(operations.size).equal(1);
        expect(operations.has('fooV1')).equal(true);
    });

    it('should be able to return an operation definition', () => {
        const introspector: ModelIntrospector = new ModelIntrospector(mockModel);
        const operation: ApiOperation = introspector.getOperationDefinition('fooV1');
        assertOperation(operation);

        const param: ApiParameter = operation.params[0];
        expect(param).deep.equal(mockModel.paths['/v1/foo'].post.parameters[0]);
    });

    it('should return null when a nonexistent operation is specified', () => {
        const introspector: ModelIntrospector = new ModelIntrospector(mockModel);
        expect(introspector.getOperationDefinition('invalidV1')).equal(undefined);
    });

    it('should resolve the built-in spec', () => {
        const introspector: ModelIntrospector = new ModelIntrospector();
        const operations: Map<string, ApiOperation> = introspector.getOperations();
        expect(operations.size > 0);
    });

    it('should invoke the customization processor', () => {
        const introspector: ModelIntrospector = new ModelIntrospector(mockModel, new MockCustomizationProcessor());
        introspector.getOperations();
    });

    function assertOperation(operation: ApiOperation): void {
        expect(operation.apiOperationName).equal('fooV1');
        expect(operation.apiVersion).equal(1);
        expect(operation.description).equal('foo');
        expect(operation.params.length).equal(1);
    }
    function assertDefinitions(definitions: Map<string, TypeDefinition>): void {
        expect(definitions.size).equals(1);
        expect(definitions.has('Foo'));
        const definition: TypeDefinition = definitions.get('Foo');
        expect(definition).deep.equal(mockModel.definitions.Foo);
    }

    class MockCustomizationProcessor implements CustomizationProcessor {
        public processOperationName(operationName: string): string {
            expect(operationName).equals('fooV1');

            return operationName;
        }
        public processOperation(operationName: string, operation: ApiOperation, definitions: Map<string, TypeDefinition>): void {
            expect(operationName).equals('fooV1');
            assertOperation(operation);
            assertDefinitions(definitions);

            return;
        }
        public processParameter(parameter: ApiParameter, parentOperation: ApiOperation, definitions: Map<string, TypeDefinition>): void {
            expect(parameter.name).equals('foo');
            assertOperation(parentOperation);
            assertDefinitions(definitions);

            return;
        }
    }

});
