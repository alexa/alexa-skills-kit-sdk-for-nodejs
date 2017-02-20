'use strict';

module.exports = (function () {
    return {
        // To evoke play the audio function, please say ask long form audio to play the audio.
        'PlayAudio': function () {
            if(this.isOverridden()) {
                return;
            }
            // Resume from where we stop last time.
            this.emit(':play');
        },
        'AMAZON.NextIntent': function () {
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
                    // Reached at the end. Thus stop playing and wait for the next command.
                    var message = 'You have reached at the end of the playlist. You may say previous, or say start over.';
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
        'AMAZON.PreviousIntent': function () {
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
                    // Reached at the top. Thus stop playing. Thus stop playing and wait for the next command.
                    var message = 'You have reached at the start of the playlist. You may say next for the next available audio.';
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
        'AMAZON.PauseIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        'AMAZON.ResumeIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            var audioFile = this.audioData[this.attributes[':playOrder'][this.attributes[':index']]];
            this.emit(':play', audioFile.title, audioFile.url);
        },
        'AMAZON.StartOverIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            this.attributes[':offsetInMilliseconds'] = 0;
            var audioFile = this.audioData[this.attributes[':playOrder'][this.attributes[':index']]];
            this.emit(':play', audioFile.title, audioFile.url);
        },
        'AMAZON.LoopOnIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            this.attributes[':loop'] = true;
            var message = 'Loop turned on.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.LoopOffIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            this.attributes[':loop'] = false;
            var message = 'Loop turned off.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.ShuffleOnIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            this.attributes[':shuffle'] = true;
            shuffleOrder.call(this, (newOrder) => {
                // Play order have been shuffled. Re-initializing indices and playing first song in shuffled order.
                this.attributes[':playOrder'] = newOrder;
                this.attributes[':index'] = 0;
                this.attributes[':offsetInMilliseconds'] = 0;
                this.attributes[':playbackIndexChanged'] = true;

                var audioFile = this.audioData[this.attributes[':playOrder'][this.attributes[':index']]];
                this.emit(':play', audioFile.title, audioFile.url);
            });
        },
        'AMAZON.ShuffleOffIntent': function () {
            if(this.isOverridden()) {
                return;
            }
            if (this.attributes[':shuffle']) {
                this.attributes[':shuffle'] = false;
                // Although changing index, no change in audio file being played as the change is to account for reordering playOrder
                this.attributes[':index'] = this.attributes[':playOrder'][this.attributes[':index']];
                this.attributes[':playOrder'] = Array.apply(null, {length: this.audioData.length}).map(Number.call, Number);
            }

            var audioFile = this.audioData[this.attributes[':playOrder'][this.attributes[':index']]];
            this.emit(':play', audioFile.title, audioFile.url);
        },
        'LoopSingleSongOn': function () {
            if(this.isOverridden()) {
                return;
            }

            this.attributes[':loopSingleSong'] = true;
            var message = 'Loop single song turned on.';

            // Enqueue the current song
            var enqueueIndex = this.attributes[':index'];
            this.attributes[':enqueuedToken'] = String(this.attributes[':playOrder'][enqueueIndex]);
            var enqueueToken = this.attributes[':enqueuedToken'];
            var audioFile = this.audioData[this.attributes[':playOrder'][enqueueIndex]];
            var playBehavior = 'REPLACE_ENQUEUED';
            var offsetInMilliseconds = 0;

            this.response.speak(message).audioPlayerPlay(playBehavior, audioFile.url, enqueueToken, null, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        'LoopSingleSongOff': function () {
            if(this.isOverridden()) {
                return;
            }

            this.attributes[':loopSingleSong'] = false;
            var message = 'Loop single song turned off.';

            // Enqueue the next song
            var enqueueIndex = this.attributes[':index'];
            enqueueIndex += 1;
            if (enqueueIndex === this.audioData.length) {
                if (this.attributes[':loop']) {
                    // Enqueueing the first item since looping is enabled.
                    enqueueIndex = 0;
                } else {
                    // Nothing to enqueue since reached end of the list and looping is disabled.
                    return this.context.succeed({});
                }
            }

            // Setting attributes to indicate item is enqueued.
            this.attributes[':enqueuedToken'] = String(this.attributes[':playOrder'][enqueueIndex]);
            var enqueueToken = this.attributes[':enqueuedToken'];
            var audioFile = this.audioData[this.attributes[':playOrder'][enqueueIndex]];
            var playBehavior = 'REPLACE_ENQUEUED';
            var offsetInMilliseconds = 0;

            this.response.speak(message).audioPlayerPlay(playBehavior, audioFile.url, enqueueToken, null, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        'PlaybackStarted': function () {
            if(this.isOverridden()) {
                return;
            }
            /*
             * AudioPlayer.PlaybackStarted Directive received.
             * Confirming that requested audio file began playing.
             * Storing details in dynamoDB using attributes.
             */
            this.attributes[':token'] = getToken.call(this);
            this.attributes[':index'] = getIndex.call(this);
            this.attributes[':heard'][this.attributes[':playOrder'][this.attributes[':index']]] = true;
            this.attributes[':playbackFinished'] = false;
            this.emit(':saveState', true);
        },
        'PlaybackFinished': function () {
            if(this.isOverridden()) {
                return;
            }
            /*
             * AudioPlayer.PlaybackFinished Directive received.
             * Confirming that audio file completed playing.
             * Storing details in dynamoDB using attributes.
             */
            this.attributes[':playbackFinished'] = true;
            this.attributes[':enqueuedToken'] = false;
            this.emit(':saveState', true);
        },
        'PlaybackStopped': function () {
            if(this.isOverridden()) {
                return;
            }
            /*
             * AudioPlayer.PlaybackStopped Directive received.
             * Confirming that audio file stopped playing.
             * Storing details in dynamoDB using attributes.
             */
            this.attributes[':token'] = getToken.call(this);
            this.attributes[':index'] = getIndex.call(this);
            this.attributes[':offsetInMilliseconds'] = getOffsetInMilliseconds.call(this);
            this.emit(':saveState', true);
        },
        'PlaybackNearlyFinished': function () {
            if(this.isOverridden()) {
                return;
            }
            /*
             * AudioPlayer.PlaybackNearlyFinished Directive received.
             * Using this opportunity to enqueue the next audio
             * Storing details in dynamoDB using attributes.
             * Enqueuing the next audio file.
             */
            if (this.attributes[':enqueuedToken']) {
                /*
                 * Since AudioPlayer.PlaybackNearlyFinished Directive are prone to be delivered multiple times during the
                 * same audio being played.
                 * If an audio file is already enqueued, exit without enqueuing again.
                 */
                return this.context.succeed({});
            }

            var enqueueIndex = this.attributes[':index'];
            // Checking if user wants to loop a single song.
            if (!this.attributes[':loopSingleSong']) {
                enqueueIndex += 1;
                // Checking if  there are any items to be enqueued.
                if (enqueueIndex === this.audioData.length) {
                    if (this.attributes[':loop']) {
                        // Enqueueing the first item since looping is enabled.
                        enqueueIndex = 0;
                    } else {
                        // Nothing to enqueue since reached end of the list and looping is disabled.
                        return this.context.succeed({});
                    }
                }
            }
            // Setting attributes to indicate item is enqueued.
            this.attributes[':enqueuedToken'] = String(this.attributes[':playOrder'][enqueueIndex]);
            var enqueueToken = this.attributes[':enqueuedToken'];
            var audioFile = this.audioData[this.attributes[':playOrder'][enqueueIndex]];
            var playBehavior = 'ENQUEUE';
            var expectedPreviousToken = this.attributes[':token'];
            var offsetInMilliseconds = 0;

            this.response.audioPlayerPlay(playBehavior, audioFile.url, enqueueToken, expectedPreviousToken, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        'PlaybackFailed': function () {
            if(this.isOverridden()) {
                return;
            }
            // AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
            console.log("Playback Failed : %j", this.event.request.error);
            this.context.succeed({});
        }
    };
})();

function shuffleOrder(callback) {
    // Algorithm : Fisher-Yates shuffle
    var array = Array.apply(null, {length: this.handler.audioData.length}).map(Number.call, Number);
    var currentIndex = array.length;
    var temp, randomIndex;

    while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    callback(array);
}

function getToken() {
    // Extracting token received in the request.
    return this.event.request.token;
}

function getIndex() {
    // Extracting index from the token received in the request.
    var tokenValue = parseInt(this.event.request.token);
    return this.attributes[':playOrder'].indexOf(tokenValue);
}

function getOffsetInMilliseconds() {
    // Extracting offsetInMilliseconds received in the request.
    return this.event.request.offsetInMilliseconds;
}
