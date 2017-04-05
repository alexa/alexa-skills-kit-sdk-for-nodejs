'use strict';

const aws = require('aws-sdk');

const newTableParams = {
  AttributeDefinitions: [
    {
      AttributeName: 'userId',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'userId',
      KeyType: 'HASH',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

/**
 * isEmptyObject - Detect if object is empty.
 *
 * @param  {Object} obj   Object to check
 * @return {boolean}      If object is empty.
 */
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

/**
 * Callback used by get/put.
 *
 * @callback dbCallback
 * @param {number} err    Error getting or putting saved attributes
 * @param {string} data   Object containing saved attributes
 */

module.exports = (function exported() {
  let doc;
  return {

    /**
     * get - Retrieve saved user attributes from DynamoDB table.
     *
     * @param  {string} table           Name of table
     * @param  {string} userId          User ID to retrieve attributes of
     * @param  {dbCallback} callback    Callback to handle data or error.
     * @return {undefined}
     */
    get(table, userId, callback) {
      if (!table) {
        callback('DynamoDB Table name is not set.', null);
      }

      if (!doc) {
        doc = new aws.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
      }

      const params = {
        Key: {
          userId,
        },
        TableName: table,
        ConsistentRead: true,
      };

      doc.get(params, (err, data) => {
        if (err) {
          console.log(`get error: ${JSON.stringify(err, null, 4)}`);

          if (err.code === 'ResourceNotFoundException') {
            const dynamoClient = new aws.DynamoDB();
            newTableParams.TableName = table;
            dynamoClient.createTable(newTableParams, (createErr, createData) => {
              if (createErr) {
                console.log(`Error creating table: ${JSON.stringify(createErr, null, 4)}`);
              }
              console.log(`'Creating table ${table}:\n ${JSON.stringify(createData)}`);
              callback(createErr, {});
            });
          } else {
            callback(err, null);
          }
        } else if (isEmptyObject(data)) {
          callback(null, {});
        } else {
          callback(null, data.Item.mapAttr);
        }
      });
    },

    /**
     * set - Store user attributes in DynamoDB table.
     *
     * @param  {string} table         Name of table to store attributes
     * @param  {string} userId        User ID
     * @param  {object} data          Object containing attributes to store
     * @param  {dbCallback} callback  Callback to handle data or error
     * @return {undefined}
     */
    set(table, userId, data, callback) {
      if (!table) {
        callback('DynamoDB Table name is not set.', null);
      }

      if (!doc) {
        doc = new aws.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
      }

      const params = {
        Item: {
          userId,
          mapAttr: data,
        },
        TableName: table,
      };

      doc.put(params, (putErr, putData) => {
        if (putErr) {
          console.log(`Error during DynamoDB put: ${putErr}`);
        }
        callback(putErr, putData);
      });
    },
  };
}());
