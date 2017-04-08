'use strict';

module.exports = (function () {
    return {
        'PlayCommandIssued': function () {
            if(this.isOverridden()) {
                return;
            }

            var audioFile = this.audioData[this.attributes[':playOrder'][this.attributes[':index']]];
            this.emit(':play', audioFile.title, audioFile.url);
        },
        'PauseCommandIssued': function () {
            if(this.isOverridden()) {
                return;
            }

            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        'NextCommandIssued': function () {
            if(this.isOverridden()) {
                return;
            }

            var index = this.attributes[':index'];
            index += 1;
            // Check for last audio file.
            if (index === this.audioData.length) {
                if (this.attributes[':loop']) {
                    index = 0;
                } else {
                    // Reached at the end.
                    var message = 'You have reached at the end of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes[':index'] = index;
            this.attributes[':offsetInMilliseconds'] = 0;
            this.attributes[':playbackIndexChanged'] = true;

            var audioFile = this.audioData[this.attributes[':playOrder'][this.attributes[':index']]];
            this.emit(':play', audioFile.title, audioFile.url);
        },
        'PreviousCommandIssued': function () {
            if(this.isOverridden()) {
                return;
            }

            var index = this.attributes[':index'];
            index -= 1;
            // Check for last audio file.
            if (index === -1) {
                if (this.attributes[':loop']) {
                    index = this.audioData.length - 1;
                } else {
                    // Reached at the end.
                    var message = 'You have reached at the start of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes[':index'] = index;
            this.attributes[':offsetInMilliseconds'] = 0;
            this.attributes[':playbackIndexChanged'] = true;

            var audioFile = this.audioData[this.attributes[':playOrder'][this.attributes[':index']]];
            this.emit(':play', audioFile.title, audioFile.url);
        }
    };
})();
