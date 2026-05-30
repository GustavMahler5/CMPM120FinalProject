/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class GameplayPrototype3 extends BaseScene {

    constructor() {

        super("gameplayprototype3");

        /*
            jubeatb2b = 0
            paranoia = 1
        */
        this.SONG = 0;

        this.spawnIndex = 0;
        this.activeEntities = [];
        
        this.ENTITY_TIMING_CONFIG =  {

            cat: { anticipationBeats: 2 },
            rat: { anticipationBeats: 1.5 },
            dog: { anticipationBeats: 3 }

        };

        // Error margins
        this.ERROR_MARGIN = 0.75;
        this.OK_ERROR = 0.25;
        this.PERFECT_ERROR = 0.1;

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;

        this.initialized = false;

    }

    preload() {

        this.load.audio('paranoia', '../assets/audio/paranoia.mp3');
        this.load.audio('jubeatb2b', '../assets/audio/jubeatb2b.mp3');
        this.load.json('score', '../assets/score.json');
        this.load.pack("main", "../assets/assets.json");

    }

    onEnter() {

        this.score = this.cache.json.get('score');
        this.notes = this.score.notes;
        this.songInfo = this.score.song;

        this.BPM = this.songInfo[this.SONG].bpm;                     // BPM
        this.BEAT_DURATION = 60 / this.BPM;                          // how many seconds is 1 beat
        this.TIME_SIGNATURE = 4;                                     // time signature
        this.SONG_DELAY = this.songInfo[this.SONG].startdelay;       // the error between when the mp3 plays and the actual song starts
        this.PICKUP_BEATS = this.songInfo[this.SONG].pickupbeats;    // how many pick up beats there are
        
        this.lastBeat = 0;                  // current beat of the measure
        this.currentBeatContinuous = 2;     // elapsed beats with decimals

        this.createMusic();
        this.createAnimations();
        this.createScene();
        
        // On user input
        this.input.on('pointerdown', () => {

            this.handleInput();

        });

    }



    update() {

        this.updateTimestamps();
        this.updateEntities();
        this.spawnEntities();
        this.updateStarShine();

    }



    createMusic() {

        // Add Music
        this.music = this.sound.add(`${this.songInfo[this.SONG].name}`);
        this.musicStarted = false;

    }



    createAnimations() {

        this.anims.create({

                key: "walking",
                frames: this.anims.generateFrameNumbers("walking", {
                    start: 0,
                    end: 1
                }),
                frameRate: this.BPM / 60,
                repeat: -1,
                
            });

    }



    createScene() {

        
        this.createBackground();
        this.createUfo();
        this.createStars();
        this.createText();

    }



    createText() {

        let disclaimer = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.05,
            "Gameplay prototype v3")
            .setStyle({ fontSize: `16px`, color: '#ff5757' })
            .setOrigin(0.5, 0.5);

        // this.debugText = this.add.text(
        //     this.SCREEN_WIDTH * 0.1,
        //     this.SCREEN_HEIGHT * 0.7,
        //     "")
        //     .setStyle({ fontSize: `16px`, color: '#FFFFFF' })
        //     .setOrigin(0, 0);

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
            .setStyle({ fontSize: `64px`, color: '#FFFFFF', fontStyle: 'bold'/*, fontFamily: "Helvetica"*/})
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



    createUfo() {

        this.ufo = this.add.sprite(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.2,
            "ufo")
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        let ufofx1 = this.ufo.enableFilters().filters.external.addGlow(0xffff00, 4, 0, 1, false, 10, 32);
        let ufofx2 = this.ufo.enableFilters().filters.external.addGlow(0xff0000, 4, 2);

        this.triangle = this.add.triangle(
            this.SCREEN_WIDTH * 0.5,        // object x
            this.SCREEN_HEIGHT * 0.5,       // object y
            0, 0,                           // top vertex
            -50, 375,                      // bottom left
            50, 375,                       // bottom right
            0xFFFF00,
        ).setOrigin(0, 0.5);

        this.triangle.setAlpha(0);

    }



    createBackground() {

        this.background = this.add.sprite(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "background")
            .setOrigin(0.5, 0.5)
            .setTint(0x777777);

        this.expandToBorder(this.background);

    }



    createStars() {

        this.stars = this.add.group();
        this.otherStars = this.add.group();

        const STAR_COUNT = 8;

        for (let i = 1; i <= STAR_COUNT; i++) {

            if (i % 2 === 0) {

                let star = this.add.sprite(
                    this.SCREEN_WIDTH * i * 0.09, 
                    this.SCREEN_HEIGHT * 0.1, 
                    "star")
                    .setScale(0.5)
                    .setAngle(Math.random() * 90);

                star.enableFilters();
                star.glow = star.filters.internal.addGlow(0xFFFFFF, 0);
                this.stars.add(star);

            } 
            else {

                let star = this.add.sprite(
                    this.SCREEN_WIDTH * i * 0.11, 
                    this.SCREEN_HEIGHT * 0.25, 
                    "star")
                    .setScale(0.5)
                    .setAngle(Math.random() * 90);

                star.enableFilters();
                star.glow = star.filters.internal.addGlow(0xFFFFFF, 0);
                this.otherStars.add(star);

            }
        }

    }



    updateDebugText() {
        
        this.debugText.setText(
`Beat: ${this.lastBeat + 1}\n
this.musicPosition (Elapsed time of music in seconds): ${this.musicPosition.toFixed(2)}\n
this.currentBeatContinuous (Elapsed beats with decimals): ${this.currentBeatContinuous.toFixed(2)}\n`);

        // this.updateDebugText(); Put this function call in update

    }



    playUfoAnimation(rating) {

        this.tweens.killTweensOf(this.triangle);
        this.triangle.setAlpha(0.3);
        let colorRating = 0xFFFF00;

        switch(rating) {

            case("perfect!"):

                colorRating = 0x00FF00;
                break;

            case("ok"):

                colorRating = 0xFFFF00;
                break;

            case("miss"):

                colorRating = 0xFF0000;
                break;

        }

        this.triangle.setFillStyle(colorRating);

        this.tweens.add({

            targets: this.triangle,
            duration: 300,
            alpha: 0,
            yoyo: false,
            repeat: 0

        })

    }



    playAbductionAnimation(rating, entity) {

        switch(rating) {

            case("perfect!"):

                this.tweens.killTweensOf(entity);

                this.tweens.add({

                    targets: entity,
                    duration: 300,
                    x: this.ufo.x,
                    y: this.ufo.y,
                    scale: 0,
                    onComplete: () => entity.destroy()

                })

                break;

            case("ok"):

                this.tweens.killTweensOf(entity);

                this.tweens.add({
                    targets: entity,
                    duration: 700,
                    x: this.ufo.x,
                    y: this.ufo.y,
                    angle: 360,
                    scale: 0,
                    onComplete: () => entity.destroy()
                })

                break;

            // Implement animation for miss **************************************************
            case("miss"):
                break;

        }
        

    }



    flashJudgement() {

        this.tweens.killTweensOf(this.judgement);
        this.judgement.setAlpha(1);

        this.tweens.add({

                targets: this.judgement,
                alpha: 0,
                duration: 500,
                yoyo: false,
                repeat: 0

            });

    }



    getJudgement(error) {

        let evaluation = "";

        if (error <= this.PERFECT_ERROR) {

            this.judgement.setText("PERFECT!");
            this.judgement.setStyle({ color: "#FFD700"});
            evaluation = "perfect!";

        } 

        else if (error <= this.OK_ERROR) {

            this.judgement.setText("Ok");
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

        this.startMusic();
        }

        let entity = this.getClosestEntity();
        if (!entity) {

            return;

        }

        let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

        // If the play clicks when no judgement window is open
        if (error > this.ERROR_MARGIN) {

            this.playUfoAnimation("perfect!");
            return;

        }

        let rating = this.getJudgement(error);

        this.lastInput.setText(`most recent input on beat ${this.currentBeatContinuous.toFixed(2)}`);

        this.applyScore(rating);
        this.playUfoAnimation(rating);
        this.playAbductionAnimation(rating, entity);

        this.activeEntities = this.activeEntities.filter(e => e !== entity);

    }



    startMusic() {

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

        let sprites = {
            dog: "walking",
            rat: "star",
            cat: "cow"
        };

        let sprite = sprites[note.type] ?? null;

        let entity = this.add.sprite(
            
            this.SCREEN_WIDTH,
            this.SCREEN_HEIGHT * 0.7,
            sprite

        ).setScale(0.5);

        let spawn = this.SCREEN_WIDTH;
        let judgementZone = this.ufo.x;            // judgement zone / UFO line
        let endingZone = this.SCREEN_WIDTH * 0.2;     // house position

        let totalDistance = Math.abs(spawn - endingZone);
        let judgeDistance = Math.abs(spawn - judgementZone);

        let timeToJudge = config.anticipationBeats * this.BEAT_DURATION * 1000;
        let totalDuration = timeToJudge * (totalDistance / judgeDistance);

        entity.x = spawn;

        this.tweens.add({

            targets: entity,
            x: endingZone,
            duration: totalDuration,
            ease: "Linear",
            onComplete: () => {

                if (entity.active) {

                    entity.destroy();

                }

            }

        });

        entity.noteType = note.type;
        entity.targetBeat = note.beat;
        entity.judged = false;

        switch(note.type) {
            case("dog") :
                entity.play("walking");
        }

        return entity;

    }



    getClosestEntity() {

        let closest = null;
        let closestError = null;

        for (let entity of this.activeEntities) {

            let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

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

                // entity.destroy();

                this.activeEntities.splice(i, 1);

                this.getJudgement(999);

                this.applyScore("miss");

            }
        }
    }



    updateTimestamps() {

        this.musicPosition = this.music.seek - this.SONG_DELAY;

        // Express this.musicPosition in terms of the current beat and BPM
        this.currentBeatContinuous = (this.musicPosition / this.BEAT_DURATION);
        this.lastBeat = Math.floor(this.currentBeatContinuous - this.PICKUP_BEATS) % this.TIME_SIGNATURE;

    }



    updateStarShine() {

        let evenBeat = (this.lastBeat % 2 == 0);

        this.stars.getChildren().forEach(star => {

            star.setAlpha(evenBeat ? 1 : 0.3);
            star.setScale(evenBeat ? 0.7 : 0.5);
            star.glow.outerStrength = evenBeat ? 4 : 0;

        });

        this.otherStars.getChildren().forEach(star => {

            star.setAlpha(evenBeat ? 0.3 : 1);
            star.setScale(evenBeat ? 0.5 : 0.7);
            star.glow.outerStrength = evenBeat ? 0 : 4;

        });
        
    }

}