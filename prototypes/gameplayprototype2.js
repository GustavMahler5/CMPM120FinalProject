/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class GameplayPrototype2 extends BaseScene {

    constructor() {

        super("gameplayprototype2");

        this.scrollSpeed = 1; // speed multiplier

        this.spawnIndex = 0;
        this.activeEntities = [];
        
        this.ENTITY_TIMING_CONFIG =  {

            cat: { anticipationBeats: 2 },
            rat: { anticipationBeats: 1.5 },
            dog: { anticipationBeats: 3 }

        };

        // Error margins
        this.ERROR_MARGIN = 0.4;
        this.OK_ERROR = 0.3;
        this.PERFECT_ERROR = 0.15;

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;

        this.initialized = false;

    }

    preload() {

        this.load.audio('paranoia', '../assets/audio/paranoia.mp3');
        this.load.audio('jubeatb2b', '../assets/audio/jubeatb2b.mp3');
        this.load.json('score', '../assets/score.json');

    }

    onEnter() {

        this.score = this.cache.json.get('score');
        this.notes = this.score.notes;
        this.songInfo = this.score.song;
        console.log(this.score);

        this.BPM = this.songInfo[0].bpm;                    // BPM
        this.BEAT_DURATION = 60 / this.BPM;                 // how many seconds is 1 beat
        this.lastBeat = 0;                                  // current beat of the measure
        this.TIME_SIGNATURE = 4;                            // time signature
        this.currentBeatContinuous = 2;                     // elapsed beats with decimals
        this.SONG_DELAY = this.songInfo[0].startdelay;      // the error between when the mp3 plays and the actual song starts
        this.PICKUP_BEATS = this.songInfo[0].pickupbeats;   // how many pick up beats there are

        // Add Music
        this.music = this.sound.add(`${this.songInfo[0].name}`);

        // Create text
        if (1) {
        let disclaimer = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.05,
            "Gameplay prototype v2")
            .setStyle({ fontSize: `16px`, color: '#ff5757' })
            .setOrigin(0.5, 0.5);

        this.debugText = this.add.text(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.7,
            "")
            .setStyle({ fontSize: `16px`, color: '#FFFFFF' })
            .setOrigin(0, 0);

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
        }

        // Add Rectangles
        this.cursor = this.add.rectangle(
            this.SCREEN_WIDTH * 0.2, 
            this.SCREEN_HEIGHT * 0.3, 
            10, 
            25,
            "0xFFFFFF")
            .setOrigin(0.5, 0.5)
            .setDepth(-1);

        this.add.rectangle(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.3,
            10,
            100,
            0xae97ff)
            .setOrigin(0.5, 0.5)
            .setDepth(2);
        
        // On user input
        this.input.on('pointerdown', () => {

            this.handleInput();

        });

        this.musicStarted = false;

    }



    update() {

        this.updateTimestamps();
        this.updateEntities();
        this.spawnEntities();
        this.updateDebugText();

    }


    updateDebugText() {

        this.debugText.setText(
`Beat: ${this.lastBeat + 1}\n
this.musicPosition (Elapsed time of music in seconds): ${this.musicPosition.toFixed(2)}\n
this.currentBeatContinuous (Elapsed beats with decimals): ${this.currentBeatContinuous.toFixed(2)}\n`);

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


    flashJudgement() {

        this.tweens.killTweensOf(this.judgement);
        this.judgement.setAlpha(1);

        this.tweens.add({

                targets: this.judgement,
                alpha: 0,
                duration: 200,
                yoyo: false,
                repeat: 0

            });

    }



    getJudgement(error) {

        let evaluation = "";

        if (error <= this.PERFECT_ERROR) {

            this.judgement.setText("perfect!");
            this.judgement.setStyle({ color: "#FFD700"});
            evaluation = "perfect!";

        } 

        else if (error <= this.OK_ERROR) {

            this.judgement.setText("ok");
            this.judgement.setStyle({ color: "#228B22"});
            evaluation = "ok";

        } 

        else {

            this.judgement.setText("miss");
            this.judgement.setStyle({ color: "#D2D2D2"});
            evaluation = "miss";

        }

        this.flashJudgement();

        return evaluation;

    }


    applyScore(rating) {

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



    handleInput() {

        // Configuration
        if (1) {
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

            this.musicStarted = true;
            return;

        }
        }

        let entity = this.getClosestEntity();
        if (!entity) {

            return;

        }

        let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

        if (error > this.ERROR_MARGIN) {

            return;

        }

        let rating = this.getJudgement(error);

        this.lastInput.setText(`most recent input on beat ${this.currentBeatContinuous.toFixed(2)}`);

        this.applyScore(rating);

        entity.destroy();
        this.activeEntities = this.activeEntities.filter(e => e !== entity);

    }


    // Add scrolling notes
    spawnEntities() {

        while (this.spawnIndex < this.notes.length) {

            let note = this.notes[this.spawnIndex];
            let config = this.ENTITY_TIMING_CONFIG[note.type];

            let spawnBeat = note.beat - config.anticipationBeats;

            if (this.currentBeatContinuous >= spawnBeat) {

                let entity = this.spawnEntity(note, config);

                this.activeEntities.push(entity);

                this.spawnIndex++;

            } else {

                break;

            }

        }

    }


    spawnEntity(note, config) {

        //eventually replace with:
    //     switch(note.type) {

    //     case "cat":
    //         return new CatEnemy(this, note);

    //     case "rat":
    //         return new RatEnemy(this, note);

    //     case "dog":
    //         return new DogEnemy(this, note);

        // }

        let colors = {
            dog: 0xFF0000,
            rat: 0x00FF00,
            cat: 0x0000FF
        };

        let entityColor = colors[note.type] ?? 0xFFFFFF;

        let entity = this.add.rectangle(
            
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.3,
            10,
            25,
            entityColor

        );

        this.tweens.add({
            targets: entity,
            duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000,
            x: this.cursor.x,
        })

        entity.noteType = note.type;
        entity.targetBeat = note.beat;
        entity.judged = false;

        return entity;

    }


    getClosestEntity() {

        let closest = null;
        let closestError = null;

        for (let entity of this.activeEntities) {

            let error = Math.abs(
                this.currentBeatContinuous - entity.targetBeat
            );

            if (closestError === null || error < closestError) {

                closest = entity;
                closestError = error;

            }
        }
        return closest;
    }


    updateEntities() {

        for (let i = this.activeEntities.length - 1; i >= 0; i--) {

            let entity = this.activeEntities[i];

            if (this.currentBeatContinuous > entity.targetBeat + this.ERROR_MARGIN) {

                entity.destroy();

                this.activeEntities.splice(i, 1);

                this.applyScore("miss");

            }
        }
    }

    updateTimestamps() {

        this.musicPosition = this.music.seek - this.SONG_DELAY;

        // Express this.musicPosition in terms of the current beat and BPM
        this.currentBeatContinuous = (this.musicPosition / this.BEAT_DURATION);
        this.lastBeat = Math.floor(this.currentBeatContinuous - this.PICKUP_BEATS) % this.TIME_SIGNATURE;
        // this.targetBeatPosition = this.getNextBeat() * this.BEAT_DURATION;

    }

}