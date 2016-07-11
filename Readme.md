# Alexa Skill Kit for Node.js (ASK)
The Alexa Skill Kit for Node.js helps you get a skill up and running quickly, letting you focus on you skill logic instead of boilerplate code.

ASK Features:
- Built using Javascript Events
- Built-in functions build Alexa responses
- 1-line configuration to enable attribute persistence with DynamoDB
- Helper functions to build state-machine based Intent handling

# Getting Started

Prerequisites:
You will need an AWS account

1. Install the ASK package. In your project directory:

```
npm install --save alexa-sdk
```
2. Create a file named index.js and add the following to it:

```
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
};

```

3. Create an event handler

There is a built-in event is emitted on session start called `NewSession`, let's create a handler for it.

```
var handlers = {
    'NewSession': function() {
        this.emit(':tell', 'Hello world!');
    }
}

```

4. Register the event handlers

Use the `registerHandlers` function to add event handler function to the Alexa event handler.

```
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
};
```

You can register multiple handler objects at once:
```
    alexa.registerHandlers(handlers1, handlers2, handlers3, ...);
```

5. Execute the incoming Lambda event

Once you are done registering all of your intent handler functions, use `execute()` to run your skill logic.

```
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
```

6. Zip and upload to Lambda

Zip `index.js` and the `node_modules` folder and upload to Lambda. Use the function ARN to point to your skill on developer.amazon.com


# Using State
The ASK will route incoming intents to the correct function handler based on state. It is simply a string stored in your session attributes indicating the current state of the skill. You can emulate the built-in intent routing by appending the state string to the intent name when defining your intent handlers, but the ASK helps do that for you.

For example, let's create a simple number-guessing game with "start" and "guess" states.

```
var states = {
    GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
    STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
};

var newSessionHandlers = {
    'NewSession': function() {
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'Welcome to High Low guessing game, would you like to play?', 'Say yes to start the game or no to quit.');
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'AMAZON.HelpIntent': function() {
        var message = 'I will think of a number between zero and one hundred, try to guess and I will tell you if it is higher or lower. Do you want to start the game?';
        this.emit(':ask', message, message);
    },
    'AMAZON.YesIntent': function() {
        this.attributes["guessNumber"] = Math.floor(Math.random() * 100);
        this.handler.state = states.GUESSMODE;
        this.emit(':ask', 'Great! ' + 'Try saying a number to start the game.', 'Try saying a number.');
    },
    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'Ok, see you next time!');
    },
    'Unhandled': function() {
        var message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
});

var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
    'NumberGuessIntent': function() {
        var guessNum = parseInt(this.event.request.intent.slots.number.value);
        var targetNum = this.attributes["guessNumber"];
        console.log('user guessed: ' + guessNum);

        if(guessNum > targetNum){
            this.emit('TooHigh');
        } else if( guessNum < targetNum){
            this.emit('TooLow');
        } else if (guessNum === targetNum){
            // You can also use callbacks, but make use to use arrow functions in order to preserve the correct context for 'this'
            this.emit('JustRight', () => {
                this.emit(':ask', 'You got it! Would you like to play a new game?', 'Say yes to start a new game, or no to end the game.');
            })
        } else {
            this.emit('NotANum');
        }
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'I am thinking of a number between zero and one hundred, try to guess and I will tell you if it is higher or lower.', 'Try saying a number.');
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
    }
});

var guessAttemptHandlers = {
    'TooHigh': function() {
        this.emit(':ask', 'Too high.', 'Try saying a smaller number.');
    },
    'TooLow': function() {
        this.emit(':ask', 'Too low.', 'Try saying a larger number.');
    },
    'JustRight': function(callback) {
        this.handler.state = states.STARTMODE;
        if(!this.attributes['gamesPlayed']){
            this.attributes['gamesPlayed'] = 1
        } else {
            this.attributes['gamesPlayed']++;
        }
        callback(); 
    },
    'NotANum': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
    }
};

```
Use `this.handler.state` to set the current skill state. It will be persisted in your skill's session attributes.

Notice that the `Alexa.CreateStateHandler` function is used. It creates an object with the correct state defined. Any intent handlers defined there will only work when the skill is in that state. Be sure to register them before you call `execute()` or they will not be found.


## Using the state sample

Here is the Intent Schema for the above:
```
{
  "intents": [
    {
      "intent": "NumberGuessIntent",
      "slots": [
        {
          "name": "number",
          "type": "AMAZON.NUMBER"
        }
      ]
    },
    {
      "intent": "AMAZON.YesIntent",
      "slots": []
    },
    {
      "intent": "AMAZON.NoIntent",
      "slots": []
    },
    {
      "intent": "AMAZON.HelpIntent",
      "slots": []
    }
  ]
}
```

And some sample utterances:
```
NumberGuessIntent {number}
NumberGuessIntent is it {number}
NumberGuessIntent how about {number}
NumberGuessIntent could it be {number}
```

Create a skill in the Developer portal called 'High low' and try it out.


# Built in functions reference
```
var speechOutput = 'Hello world!';
var repromptSpeech = 'Hello again!';

this.emit(':tell', speechOutput);

this.emit(':ask', speechOutput, repromptSpeech);

var cardTitle = 'Hello World Card';
var cardContent = 'This text will be displayed in the companion app card.';

var imageObj = {
    smallImageUrl: 'http://imgs.xkcd.com/comics/quadcopter.png',
    largeImageUrl: 'http://imgs.xkcd.com/comics/quadcopter.png'

};

this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, imageObj);

this.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);

this.emit(':tellWithLinkAccountCard', speechOutput);

this.emit(':askWithLinkAccountCard', speechOutput);

this.emit(':responseReady');

this.emit(':saveState');

this.emit(':saveStateError');

```