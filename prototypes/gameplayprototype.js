/*
Have all scenes extend the custom engine for this project: "Engine"
We will put all global variables and static functions into engine.js 
to maintain code readability and neatness.
*/

class GameplayPrototype extends Engine {

    constructor() {

        super("gameplayprototype");

        this.BPM = 180;                                 // BPM
        this.BEAT_DURATION = 60 / this.BPM;             // 0.33 -> how many seconds is 1 beat
        this.lastBeat = 0;                              // current beat of the measure
        this.targetBeatPosition = this.BEAT_DURATION;   // timestamp of the upcoming beat
        this.TIME_SIGNATURE = 4;                        // time signature
        this.activeBeat = -1;                           // pseudo boolean - holds -1 if the window is closed and the beat number if open
        this.targetBeat = 4;                            // The beat who's judgement window is next to open
        this.currentBeatContinuous = 0;                 // timestamp of the next beat that the judgement window will be based on

        // Error margins
        this.ERROR_MARGIN = 0.4;
        this.OK_ERROR = 0.3;
        this.PERFECT_ERROR = 0.15;
        this.SONG_DELAY = 0.25;

        // The open window of the upcoming judgement window. Not used at all for now
        // this.activeBeatStart = this.targetBeat - this.ERROR_MARGIN;
        // this.activeBeatEnd = this.targetBeat + this.ERROR_MARGIN;

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;

        this.initialized = false;

    }

    preload() {

        this.load.audio('paranoia', '../assets/audio/paranoia.mp3');

    }

    create() {

        // Add Music
        this.music = this.sound.add('paranoia');

        // Create text
        let disclaimer = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.05,
            "Gameplay prototyping goes here")
            .setStyle({ fontSize: `16px`, color: '#ff5757' })
            .setOrigin(0.5, 0.5);

        this.debugText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.7,
            "")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

        this.lastInput = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.9,
            "")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);
            
        this.judgement = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

        this.perfectScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.04,
            `Perfect: ${this.perfectCount}`)
            .setStyle({ fontSize: `16px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);
        
        this.okScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.07,
            `Ok: ${this.okCount}`)
            .setStyle({ fontSize: `16px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);
        
        this.missScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.1,
            `Miss: ${this.missCount}`)
            .setStyle({ fontSize: `16px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);


        // Add Rectangles
        this.cursor = this.add.rectangle(
            this.SCREEN_WIDTH * 0.1, 
            this.SCREEN_HEIGHT * 0.3, 
            10, 
            25,
            "0xFFFFFF")
            .setOrigin(0.5, 0.5);

        for (let i = 0; i < this.TIME_SIGNATURE + 1; i++) {

            this.add.rectangle(
                this.SCREEN_WIDTH * (0.1 + i * 0.2),
                this.SCREEN_HEIGHT * 0.3,
                20,
                50,
                0x00FF00)
                .setOrigin(0.5, 0.5)
                .setDepth(-1);
                
        }

        
        // On user input
        this.input.on('pointerdown', () => {

            // DELETE LATER TESTING
            this.add.rectangle(
                this.cursor.x, 
                this.cursor.y, 
                10, 
                25,
                "0x0000FF")
                .setOrigin(0.5, 0.5);

            this.handleInput(this.currentBeatContinuous, this.targetBeat);

        });

        this.musicStarted = false;

    }

    update() {

        this.musicPosition = this.music.seek - this.SONG_DELAY;

        // Express this.musicPosition in terms of the current beat and BPM
        this.currentBeatContinuous = (((this.musicPosition / this.BEAT_DURATION) % this.TIME_SIGNATURE) + 1);

        // Update lastBeat and nextBeatPosition upon landing on a new beat
        if (this.musicPosition >= this.targetBeatPosition) {

            this.lastBeat = (this.lastBeat + 1) % this.TIME_SIGNATURE;
            this.targetBeatPosition += this.BEAT_DURATION;

        }

        // Set the next beat to be active upon entering the timing window 
        if (Math.abs(this.currentBeatContinuous - this.targetBeat) <= this.ERROR_MARGIN) {

            this.activeBeat = this.targetBeat;

        }

        else {

            this.activeBeat = -1;

        }

        // If the player has missed the last beat without an attempted input
        if (this.currentBeatContinuous > this.targetBeat + this.ERROR_MARGIN) {

            this.targetBeat = this.getActiveBeat();

        }

        this.updateDebugText();

    }



    getActiveBeat() {

        return ((this.lastBeat + 1) % this.TIME_SIGNATURE) + 1;

    }


    updateDebugText() {

        this.debugText.setText(
            `           Beat: ${this.lastBeat + 1} 
            this.musicPosition:       ${this.musicPosition.toFixed(2)} 
            this.targetBeatPosition:  ${this.targetBeatPosition.toFixed(2)} 
            this.currentActiveBeat:   ${this.currentBeatContinuous.toFixed(2)} 
            this.targetBeat:          ${this.targetBeat}`);

    }



    startTween() {

        this.time.delayedCall( 

            this.SONG_DELAY * 1000,

            () =>   this.tweens.add({

                        targets: this.cursor,
                        x: this.SCREEN_WIDTH * 0.9,
                        duration: this.BEAT_DURATION * this.TIME_SIGNATURE * 1000,
                        yoyo: false,
                        repeat: -1

                    })
        )

    }



    getJudgement(error) {

        let evaluation = "";

        if (error <= this.PERFECT_ERROR) {

            this.judgement.setText("perfect!");
            evaluation = "perfect!";

        } 

        else if (error <= this.ERROR_MARGIN) {

            this.judgement.setText("ok");
            evaluation = "ok";

        } 

        else {

            this.judgement.setText("miss");
            evaluation = "miss";

        }

        this.tweens.killTweensOf(this.judgement);
        this.judgement.setAlpha(1);

        this.tweens.add({

                targets: this.judgement,
                alpha: 0,
                duration: 200,
                yoyo: false,
                repeat: 0

            });

        return evaluation;

    }



    handleInput(inputTime, comparedTime) {

        if (!this.music) return;

        // Click once to initialize the game. Used for synching purposes
        if (!this.initialized) {

            this.initialized = true;
            return;

        }

        if (!this.musicStarted) {

            this.music.play({ 
                loop: false, 
                volume: 0.05,
                rate: 1
            });

            this.startTween();
            this.musicStarted = true;

        }

        let error = Math.abs(inputTime - comparedTime);
        let wrapError = this.TIME_SIGNATURE - error;
        error = Math.min(error, wrapError);
        let rating = this.getJudgement(error);

        this.lastInput.setText(`most recent input on beat ${inputTime.toFixed(2)}`);

        switch(rating) {

            case("perfect!"):

                this.perfectCount++;
                this.perfectScore.setText(`Perfect: ${this.perfectCount}`);
                break;

            case("ok"):

                this.okCount++;
                this.okScore.setText(`Ok: ${this.okCount}`);
                break;

            case("miss"):

                this.missCount++;
                this.missScore.setText(`Miss: ${this.missCount}`);
                break;

            default:

                return;

        }

    }

}