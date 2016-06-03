'use strict';
var aws = require('aws-sdk');
var doc;

module.exports = (function() {
    return {
        get: function(userId, callback) {
            if(!this.dynamoDBTableName) {
                this.context.fail('DynamoDB table name is not set.');
            }

            if(!doc) {
                doc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
            }

            var params = {
                Key: {
                    userId: userId
                },
                TableName: this.dynamoDBTableName,
                ConsistentRead: true
            };

            doc.get(params, function(err, data){
                if(err) {
                    console.log('get error: ' + JSON.stringify(err, null, 4));
                    callback(err, null);
                } else {
                    if(isEmptyObject(data)) {
                        callback(null, {});
                    } else {
                        callback(null, data.Item['mapAttr']);
                    }
                }
            });
        },

        set: function(userId, data, callback) {
            if(!this.dynamoDBTableName) {
                this.context.fail('DynamoDB table name is not set.');
            }

            if(!doc) {
                doc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
            }

            var params = {
                Item: {
                    userId: userId,
                    mapAttr: data
                },
                TableName: this.dynamoDBTableName
            };

            doc.put(params, function(err, data) {
                if(err) {
                    console.log('Error during DynamoDB put:' + err);
                }

                callback(err, data);
            });
        }
    };
})();

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}