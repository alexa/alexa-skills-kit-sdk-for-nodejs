'use strict';
var aws = require('aws-sdk');

module.exports = function(options) {
    var dynamoDBClient = options.dynamoDBClient || new aws.DynamoDB({apiVersion: '2012-08-10'});
    var doc = new aws.DynamoDB.DocumentClient({service: dynamoDBClient});

    return {
        get: function(table, userId, callback) {
            if(!table) {
                callback('DynamoDB Table name is not set.', null);
            }

            var params = {
                Key: {
                    userId: userId
                },
                TableName: table,
                ConsistentRead: true
            };

            doc.get(params, function(err, data){
                if(err) {
                    console.log('get error: ' + JSON.stringify(err, null, 4));

                    if(err.code === 'ResourceNotFoundException') {
                        newTableParams['TableName'] = table;
                        dynamoDBClient.createTable(newTableParams, function (err, data) {
                            if(err) {
                                console.log('Error creating table: ' + JSON.stringify(err, null, 4));
                            }
                            console.log('Creating table ' + table + ':\n' + JSON.stringify(data));
                            callback(err, {});
                        });
                    } else {
                        callback(err, null);
                    }
                } else {
                    if(isEmptyObject(data)) {
                        callback(null, {});
                    } else {
                        callback(null, data.Item['mapAttr']);
                    }
                }
            });
        },

        set: function(table, userId, data, callback) {
            if(!table) {
                callback('DynamoDB Table name is not set.', null);
            }

            var params = {
                Item: {
                    userId: userId,
                    mapAttr: data
                },
                TableName: table
            };

            doc.put(params, function(err, data) {
                if(err) {
                    console.log('Error during DynamoDB put:' + err);
                }
                callback(err, data);
            });
        }
    };
};

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

var newTableParams = {
    AttributeDefinitions: [
        {
            AttributeName: 'userId',
            AttributeType: 'S'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'userId',
            KeyType: 'HASH'
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};
