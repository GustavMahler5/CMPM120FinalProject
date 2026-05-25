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
        this.nextBeatPosition = this.BEAT_DURATION;     // timestamp of the upcoming beat
        this.TIME_SIGNATURE = 4;                        // time signature
        this.activeBeat = -1;                           // pseudo boolean - holds -1 if the window is closed and the beat number if open
        this.nextBeat = 4;    
        this.currentBeatContinuous = 0;                 // timestamp of the next beat that the judgement window will be based on

        // Error margins
        this.ERROR_MARGIN = 0.4;
        this.OK_ERROR = 0.3;
        this.PERFECT_ERROR = 0.15;
        this.SONG_DELAY = 0.25;

        // The open window of the upcoming judgement window
        this.activeBeatStart = this.nextBeat - this.ERROR_MARGIN;
        this.activeBeatEnd = this.nextBeat + this.ERROR_MARGIN;

        this.initialized = false;

    }

    preload() {
        this.load.audio('paranoia', '../assets/audio/paranoia.mp3');
    }

    create() {

        // Add Music
        this.music = this.sound.add('paranoia');

        // Create text
        let placeholder = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.05,
            "Gameplay prototyping goes here")
            .setStyle({ fontSize: `16px`, color: '#ff5757' })
            .setOrigin(0.5, 0.5);

        this.BPMText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.6,
            `${this.lastBeat}`)
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

        this.test = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.7,
            "")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

        this.lastInput = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.8,
            "")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);
            
        this.judgement = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);


        // Add Rectangles
        this.cursor = this.add.rectangle(
            this.SCREEN_WIDTH * 0.1, 
            this.SCREEN_HEIGHT * 0.3, 
            10, 
            25,
            "0xFFFFFF")
            .setOrigin(0.5, 0.5);

        // for (let i = 0.1; i <= 0.9; i += 0.8 / (this.TIME_SIGNATURE - 1)) {
        //     this.add.rectangle(
        //         this.SCREEN_WIDTH * (i), 
        //         this.SCREEN_HEIGHT * 0.3, 
        //         20, 
        //         50,
        //         "0xFF0000")
        //         .setOrigin(0.5, 0.5)
        //         .setDepth(-1);
        // }
        for (let i = 0; i < this.TIME_SIGNATURE + 1; i++) {

            this.add.rectangle(
                this.SCREEN_WIDTH * (0.1 + i * 0.2),
                this.SCREEN_HEIGHT * 0.3,
                20,
                50,
                0x00FF00
            )
            .setOrigin(0.5, 0.5)
            .setDepth(-1);
        }
        // this.add.rectangle(
        //     this.SCREEN_WIDTH * 0.1, 
        //     this.SCREEN_HEIGHT * 0.3, 
        //     20, 
        //     50,
        //     "0xFF0000")
        //     .setOrigin(0.5, 0.5)
        //     .setDepth(-1);
        
        // this.add.rectangle(
        //     this.SCREEN_WIDTH * 0.9, 
        //     this.SCREEN_HEIGHT * 0.3, 
        //     20, 
        //     50,
        //     "0xFF0000")
        //     .setOrigin(0.5, 0.5)
        //     .setDepth(-1);

        
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

            this.handleInput(this.currentBeatContinuous, this.nextBeat);
        });

        this.musicStarted = false;

    }

    update() {

        this.musicPosition = this.music.seek - this.SONG_DELAY;

        // Express this.musicPosition in terms of the current beat and BPM
        this.currentBeatContinuous = (((this.musicPosition / this.BEAT_DURATION) % this.TIME_SIGNATURE) + 1);

        if (this.musicPosition >= this.nextBeatPosition) {

            this.lastBeat = (this.lastBeat + 1) % this.TIME_SIGNATURE;
            // call function this.triggerEvent();
            this.nextBeatPosition += this.BEAT_DURATION;

        }

        // this.nextBeat = ((this.lastBeat + 1) % this.TIME_SIGNATURE) + 1;

        if (this.musicPosition - this.nextBeat < Number.EPSILON) {
            this.activeBeat = this.musicPosition;
        }
        else {
            this.activeBeat = -1;
        }
        if (this.currentBeatContinuous > this.nextBeat + this.ERROR_MARGIN) {
            this.nextBeat = this.getActiveBeat();
        }

        this.BPMText.setText(`Beat: ${this.lastBeat + 1}`);
        this.test.setText(
            `this.musicPosition: ${this.musicPosition.toFixed(2)} 
            this.nextBeatPosition: ${this.nextBeatPosition.toFixed(2)} 
            this.currentActiveBeat: ${this.currentBeatContinuous.toFixed(2)}
            this.nextBeat: ${this.nextBeat}`);
    }


    getActiveBeat() {
        return ((this.lastBeat + 1) % this.TIME_SIGNATURE) + 1;
    }


    startTween() {
        this.time.delayedCall( 
            this.SONG_DELAY * 1000, 
            () => 
            this.tweens.add({
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
        this.judgement.tween
        this.judgement.setAlpha(1);

        if (error <= this.PERFECT_ERROR) {
            this.judgement.setText("perfect!");
            evaluation = "perfect!";
            // return "perfect!";
        } 
        else if (error <= this.ERROR_MARGIN) {
            this.judgement.setText("ok");
            evaluation = "ok";
            // return "ok";
        } 
        else {
            this.judgement.setText("miss");
            evaluation = "miss";
            // return "miss";
        }
        this.tweens.add({
                targets: this.judgement,
                alpha: 0,
                duration: 200,
                yoyo: false,
                repeat: 0
            });

    }


    getInputTime(timestamp) {
        
    }


    handleInput(inputTime, comparedTime) {

        if (!this.music) return;
        if (!this.initialized) {
            this.initialized = true;
            return;
        }

        if (!this.musicStarted) {
            this.music.play({ 
                loop: false, 
                volume: 0.1,
                // seek: this.SONG_DELAY,
                rate: 1
            });
            this.startTween();
            this.musicStarted = true;
        }

        let error = Math.abs(inputTime - comparedTime);
        let wrapError = this.TIME_SIGNATURE - error;
        error = Math.min(error, wrapError);
        let rating = this.getJudgement(error);

        this.lastInput.setText(`most recent input on ${inputTime.toFixed(2)}`);

        switch(rating) {
            case("perfect!"):
                // handle perfect
            case("ok"):
                // handle ok
            case("miss"):
                // handle miss
            default:
                return;
        }

    }
}