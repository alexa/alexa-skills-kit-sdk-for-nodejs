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

/**
 * Introspects on the Skill Management API (SMAPI) model.
 */
export class ModelIntrospector {
    private operations: Map<string, ApiOperation>;
    private definitions: Map<string, TypeDefinition>;
    private modelJson: any;
    private customizationProcessor: CustomizationProcessor;

    constructor(modelJson? : any, customizationProcessor? : CustomizationProcessor) {
        if (!modelJson) {
            const modelContent: string = require('ask-smapi-model/spec.json');
            this.modelJson = modelContent;
        } else {
            this.modelJson = modelJson;
        }
        this.customizationProcessor = customizationProcessor;
        this.processModel();
    }

    /**
     * Returns the operation definition for a given Skill Management API (SMAPI) operation.
     * @param operationName operation name
     */
    public getOperationDefinition(operationName: string): ApiOperation {
        return this.operations.get(operationName);
    }

    /**
     * Returns a Map of all Skill Management API (SMAPI) operations
     */
    public getOperations(): Map<string, ApiOperation> {
        return this.operations;
    }

    private processModel(): void {
        const modelDefinitions = this.modelJson.definitions;
        this.definitions = new Map(Object.keys(modelDefinitions).map((key) => [key, modelDefinitions[key]]));

        const operationDefinitions: any[] = [];
        Object.keys(this.modelJson.paths).forEach((pathKey) => {
            Object.keys(this.modelJson.paths[pathKey]).forEach((operationKey) => {
                operationDefinitions.push(this.modelJson.paths[pathKey][operationKey]);
            });
        });

        this.operations = new Map();
        for (const operationDefinition of operationDefinitions) {
            const apiOperationName = operationDefinition['x-operation-name'];
            if (apiOperationName) {
                const apiVersion = parseInt(apiOperationName.substring(apiOperationName.length - 1), 10);
                const apiOperation: ApiOperation = {
                    apiOperationName,
                    apiVersion,
                    description: operationDefinition.description,
                    params: operationDefinition.parameters,
                    customizationMetadata: {},
                };
                const processedOperationName = this.customizationProcessor ? this.customizationProcessor.processOperationName(apiOperationName) : apiOperationName;
                if (this.customizationProcessor) {
                    this.customizationProcessor.processOperation(processedOperationName, apiOperation, this.definitions);
                    for (const param of apiOperation.params) {
                        this.customizationProcessor.processParameter(param, apiOperation, this.definitions);
                    }
                }
                if (!this.operations.has(processedOperationName) || apiVersion > this.operations.get(processedOperationName).apiVersion) {
                    this.operations.set(processedOperationName, apiOperation);
                }
            }
        }
    }
}

/**
 * Customization processors are executed while processing a specification and can apply custom logic.
 */
export interface CustomizationProcessor {
    /**
     * Processes an API operation name
     * @param operationName operation name
     */
    processOperationName(operationName: string): string;

    /**
     * Processes an API operation
     * @param operationName processed operation name
     * @param operation operation definition
     * @param definitions map of modeled API definitions
     */
    processOperation(operationName: string, operation: ApiOperation, definitions: Map<string, TypeDefinition>): void;

    /**
     * Processes an API parameter
     * @param parameter parameter definition
     * @param parentOperation operation this parameter belongs to
     * @param definitions map of modeled API definitions
     */
    processParameter(parameter: ApiParameter, parentOperation: ApiOperation, definitions: Map<string, TypeDefinition>): void;
}

/**
 * Represents an API operation.
 */
export interface ApiOperation {
    apiOperationName: string;
    apiVersion: number;
    description: string;
    params: ApiParameter[];
    customizationMetadata: { [key: string]: any };
}

/**
 * Represents an API type definition.
 */
export interface TypeDefinition {
    type: string;
    description: string;
    required: boolean;
    enum: string[];
    items: {};  /* eslint-disable-line @typescript-eslint/ban-types */
    properties: { [key: string]: ApiParameter };
}

/**
 * Represents an API parameter.
 */
export interface ApiParameter extends TypeDefinition {
    name: string;
    schema: {
        $ref: string;
    };
    $ref: string;
    customizationMetadata: { [key: string]: any };
}
