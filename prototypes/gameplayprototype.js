/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/


class GameplayPrototype extends BaseScene {

    constructor() {

        super("gameplayprototype");

        this.BPM = 180;                         // BPM
        this.BEAT_DURATION = 60 / this.BPM;     // 0.33 -> how many seconds is 1 beat
        this.TIME_SIGNATURE = 4;                // time signature

        // Error margins
        this.ERROR_MARGIN = 0.4;
        this.OK_ERROR = 0.3;
        this.PERFECT_ERROR = 0.2;
        this.SONG_DELAY = 0.27;

        // The open window of the upcoming judgement window. Not used at all for now
        // this.activeBeatStart = this.targetBeat - this.ERROR_MARGIN;
        // this.activeBeatEnd = this.targetBeat + this.ERROR_MARGIN;

    }

    init(data) {

        this.lastBeat = 0;                              // current beat of the measure
        this.targetBeatPosition = this.BEAT_DURATION;   // timestamp of the upcoming beat

        this.activeBeat = -1;                           // pseudo boolean - holds -1 if the window is closed and the beat number if open
        this.targetBeat = 1;                            // The beat who's judgement window is next to open
        this.nextBeat = 0;                              // The next beat in order
        this.currentBeatContinuous = 0;                 // timestamp of the next beat that the judgement window will be based on
        
        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;

        this.initialized = false;

        // Maybe delete me in the final iteration.... or don't
        this.justAGlobalVariable = data.global ?? 0;

    }

    preload() {

        this.load.audio('paranoia', '../assets/audio/paranoia.mp3');
        this.load.json('score', '../assets/score.json');

    }

    onEnter() {

        // Add Music
        this.music = this.sound.add('paranoia');

        this.score = this.cache.json.get('score');
        this.notes = this.score.notes;
        console.log(this.score);

        // this.targetBeat = this.getNextBeat();

        // Create text
        if(1) {
        let disclaimer = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.05,
            "Gameplay prototype v0")
            .setStyle({ fontSize: `16px`, color: '#ff5757' })
            .setOrigin(0.5, 0.5);

        this.debugText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.65,
            "")
            .setStyle({ fontSize: `16px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

        this.lastInput = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.9,
            "")
            .setStyle({ fontSize: `16px`, color: '#FFFFFF' })
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
            .setStyle({ fontSize: `16px`, color: '#FFD700' })
            .setOrigin(0.5, 0.5);
        
        this.okScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.07,
            `Ok: ${this.okCount}`)
            .setStyle({ fontSize: `16px`, color: '#228B22' })
            .setOrigin(0.5, 0.5);
        
        this.missScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.1,
            `Miss: ${this.missCount}`)
            .setStyle({ fontSize: `16px`, color: '#D3D3D3' })
            .setOrigin(0.5, 0.5);

        this.backButton = this.add.text(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.1,
            `<- Back`)
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0, 0)
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.game.sound.stopAll();
                this.changeScene('CinematicsMenuPrototype');
            })

        this.startText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.45,
            `Start testing`)
            .setStyle({ fontSize: `64px`, color: '#00FF00' })
            .setOrigin(0.5, 0.5)
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.music.play({ 
                    loop: false, 
                    volume: 0.05,
                    rate: 1
                });
                this.startTween();
                this.musicStarted = true;
                this.startText.destroy();
            })
        }


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
        let error = Math.abs(this.currentBeatContinuous - this.targetBeat);
        let wrapError = this.TIME_SIGNATURE - error;
        let beatDistance = Math.min(error, wrapError);

        if (beatDistance <= this.ERROR_MARGIN) {

            this.activeBeat = this.targetBeat;

        }

        else {

            this.activeBeat = -1;

        }

        // If the player has missed the last beat without an attempted input
        if (this.currentBeatContinuous > this.targetBeat + this.ERROR_MARGIN) {

            // this.getJudgement(1);
            this.targetBeat = this.getNextBeat();

        }

        this.updateDebugText();

    }


    // FIX LOGIC MAYBE
    getNextBeat() {

        return ((this.lastBeat + 1) % this.TIME_SIGNATURE + 1);

    }


    updateDebugText() {

        this.debugText.setText(
`Beat: ${this.lastBeat + 1}\n
this.musicPosition (Elapsed time of music in seconds): ${this.musicPosition.toFixed(2)}\n
this.targetBeatPosition (Next Beat location in seconds): ${this.targetBeatPosition.toFixed(2)}\n
this.currentBeatContinuous (Elapsed beats with decimals): ${this.currentBeatContinuous.toFixed(2)}\n
this.targetBeat (The next downbeat integer which has a note): ${this.targetBeat}`);

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

            this.perfectCount++;
            this.judgement.setText("perfect!");
            this.judgement.setStyle({ color: "#FFD700"});
            evaluation = "perfect!";

        } 

        else if (error <= this.OK_ERROR) {

            this.okCount++;
            this.judgement.setText("ok");
            this.judgement.setStyle({ color: "#228B22"});
            evaluation = "ok";

        } 

        else {

            this.missCount++;
            this.judgement.setText("miss");
            this.judgement.setStyle({ color: "#D2D2D2"});
            evaluation = "miss";

        }

        this.tweens.killTweensOf(this.judgement);
        this.judgement.setAlpha(1);

        this.tweens.add({

                targets: this.judgement,
                alpha: 0,
                duration: 1000,
                yoyo: false,
                repeat: 0

            });

        return evaluation;

    }



    handleInput(inputTime, comparedTime) {

        if (this.activeBeat === -1) {

            return;

        }

        let error = Math.abs(inputTime - comparedTime);
        let wrapError = this.TIME_SIGNATURE - error;
        error = Math.min(error, wrapError);
        let rating = this.getJudgement(error);

        this.lastInput.setText(`most recent input on beat ${inputTime.toFixed(2)}`);

        // DELETE LATER TESTING
            this.add.rectangle(
                this.cursor.x, 
                this.cursor.y, 
                10, 
                25,
                "0x0000FF")
                .setOrigin(0.5, 0.5);

        switch(rating) {

            case("perfect!"):

                this.perfectScore.setText(`Perfect: ${this.perfectCount}`);
                break;

            case("ok"):

                this.okScore.setText(`Ok: ${this.okCount}`);
                break;

            case("miss"):

                this.missScore.setText(`Miss: ${this.missCount}`);
                break;

            default:

                return;

        }

        this.targetBeat = this.getNextBeat();

    }

}