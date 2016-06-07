# Built in functions
```javascript
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