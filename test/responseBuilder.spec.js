/* jshint expr: true */ // So we can use chai assertions
'use strict';

const expect = require('chai').expect;
const ResponseBuilder = require('../lib/responseBuilder').ResponseBuilder;
const CARD_TYPES = require('../lib/responseBuilder').CARD_TYPES;
const DIRECTIVE_TYPES = require('../lib/responseBuilder').DIRECTIVE_TYPES;
const HINT_TYPES = require('../lib/responseBuilder').HINT_TYPES;

describe('ResponseBuilder Tests', () => {
    let responseBuilder;
    let response;
    beforeEach(() => {
        let responseContainer = {
            response : {},
            _event : {
                session : {
                    attributes : {}
                }
            }
        };
        responseBuilder = new ResponseBuilder(responseContainer);
        response = responseContainer.response.response;
    });

    it('should record speech on response object', () => {
        const expectedSpeech = 'hello world';
        const result = responseBuilder.speak(expectedSpeech);

        expect(response.outputSpeech.ssml).to.contain(expectedSpeech);
        expect(result).to.equal(responseBuilder);
    });

    it('should not end session if asked to listen', () => {
        const expectedReprompt = 'my reprompt';
        const result = responseBuilder.listen(expectedReprompt);

        expect(response.reprompt.outputSpeech.ssml).to.contain('my reprompt');
        expect(response.shouldEndSession).to.be.false;
        expect(result).to.equal(responseBuilder);
    });

      it('should make a card', () => {
        const expectedTitle = 'my reprompt';
        const result = responseBuilder.cardRenderer(expectedTitle, "", {});

        expect(response.card.title).to.contain(expectedTitle);
        expect(result).to.equal(responseBuilder);
    });

    it('should make a link account card', () => {
        const result = responseBuilder.linkAccountCard();

        expect(response.card.type).to.equal(CARD_TYPES.LINK_ACCOUNT);
        expect(result).to.equal(responseBuilder);
    });

    it('should create audioPlayer directive on play', () => {
        const result = responseBuilder.audioPlayerPlay('', '', '', '', '');

        expect(response.directives.length).to.equal(1);
        expect(response.directives[0].type).to.equal(DIRECTIVE_TYPES.AUDIOPLAYER.PLAY);
        expect(result).to.equal(responseBuilder);
    });

    it('should create audioPlayer directive on stop', () => {
        const result = responseBuilder.audioPlayerStop();

        expect(response.directives.length).to.equal(1);
        expect(response.directives[0].type).to.equal(DIRECTIVE_TYPES.AUDIOPLAYER.STOP);
        expect(result).to.equal(responseBuilder);
    });

    it('should create audioPlayer directive on clearQueue', () => {
        const result = responseBuilder.audioPlayerClearQueue("");

        expect(response.directives.length).to.equal(1);
        expect(response.directives[0].type).to.equal(DIRECTIVE_TYPES.AUDIOPLAYER.CLEAR_QUEUE);
        expect(result).to.equal(responseBuilder);
    });

    it('should create rendertemplate directive', () => {
        const result = responseBuilder.renderTemplate({});
        expect(response.directives.length).to.equal(1);
        expect(response.directives[0].type).to.equal(DIRECTIVE_TYPES.DISPLAY.RENDER_TEMPLATE);
        expect(result).to.equal(responseBuilder);
    });

    it('should create rendertemplate directive', () => {
        const result = responseBuilder.renderTemplate({});
        expect(response.directives.length).to.equal(1);
        expect(response.directives[0].type).to.equal(DIRECTIVE_TYPES.DISPLAY.RENDER_TEMPLATE);
        expect(result).to.equal(responseBuilder);
    });

    it('should create hint directive', () => {
        const result = responseBuilder.hint('hint text');
        expect(response.directives.length).to.equal(1);
        expect(response.directives[0].type).to.equal(DIRECTIVE_TYPES.HINT);
        expect(response.directives[0].hint.type).to.equal(HINT_TYPES.PLAIN_TEXT);
        expect(result).to.equal(responseBuilder);
    });

    it('should create videoapp directive', () => {
        const result = responseBuilder.playVideo('url');
        expect(response.directives.length).to.equal(1);
        expect(response.directives[0].type).to.equal(DIRECTIVE_TYPES.VIDEOAPP.LAUNCH);
        expect(result).to.equal(responseBuilder);
    });

    it('should remove shouldEndSession when specifying videoApp directive', () => {
        responseBuilder.playVideo('url');
        expect(response.shouldEndSession).to.be.undefined;
    });
});