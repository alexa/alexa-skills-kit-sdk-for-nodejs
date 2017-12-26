'use strict';

class VoicePlayerSpeakDirective {

    /**
     * Creates an instance of VoicePlayerSpeakDirective.
     * @param {string} requestId - requestId from which the call is originated from
     * @param {string} speechContent - Contents of the speech directive either in plain text or SSML.
     * @memberof DirectiveService
     */
    constructor(requestId, speechContent) {
      this.header = {
          requestId: requestId
      };
      this.directive = {
          type: 'VoicePlayer.Speak',
          speech: speechContent
      };
    }
}

module.exports = VoicePlayerSpeakDirective;