var AlexaLambdaHandler = require('./lib/alexa');
var AlexaAudioHandler = require('./lib/audioPlayer');
var AlexaRemoteControllerHandler = require('./lib/remoteController');
var AlexaAttributesHelper = require('./lib/DynamoAttributesHelper');

module.exports.handler = AlexaLambdaHandler.LambdaHandler;
module.exports.CreateStateHandler = AlexaLambdaHandler.CreateStateHandler;
module.exports.InitializeAudioAttributes = AlexaLambdaHandler.InitializeAudioAttributes;
module.exports.StateString = AlexaLambdaHandler.StateString;
module.exports.AlexaAudioHandler = AlexaAudioHandler;
module.exports.AlexaDynamoDBHelper = AlexaAttributesHelper;
module.exports.AlexaRemoteControllerHandler = AlexaRemoteControllerHandler;