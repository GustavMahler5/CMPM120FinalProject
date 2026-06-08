/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class GameplayPrototype2 extends BaseScene {



    constructor() {

        super("gameplayprototype2");

        /*
            jubeatb2b = 0
            paranoia = 1
            bossa = 2
        */
        this.SONG = 0;
        
        this.ENTITY_TIMING_CONFIG = {

            human: {

                anticipationBeats: 3,
                cues: [
                    { leadBeats: 1, sfx: "human"},
                ]

            },

            cow: {

                anticipationBeats: 4,
                cues: [
                    { leadBeats: 2, sfx: "human"},
                    { leadBeats: 1.5, sfx: "human"},
                    { leadBeats: 1, sfx: "human"}
                ]

            },

            ghost: {

                anticipationBeats: 2,
                cues: [
                    { leadBeats: 2.5, sfx: "human"},
                    { leadBeats: 1.5, sfx: "human"},
                    { leadBeats: 1, sfx: "human"},
                ]

            }

        };

        this.ENTITY_SPAWN_LOCATION = 1

        // Error margins
        this.ERROR_MARGIN = 0.75;
        this.OK_ERROR = 0.25;
        this.PERFECT_ERROR = 0.1;

        this.MOON_SCALE = 0.2

    }



    preload() {

        this.load.json('score', '../assets/beatmaps/level3score.json');
        this.load.pack("main", "../assets/level3assets.json");

    }



    onEnter() {

        this.sound.removeAll();

        this.score = this.cache.json.get('score');
        this.notes = this.score.notes;

        this.totalNotes = this.notes.length;
        this.songInfo = this.score.song;
        this.perfectPoints = this.MAXIMUM_SCORE / this.totalNotes;
        this.okPoints = (this.MAXIMUM_SCORE * 0.75) / this.totalNotes;

        this.BPM = this.songInfo[this.SONG].bpm;                     // BPM
        this.BEAT_DURATION = 60 / this.BPM;                          // how many seconds is 1 beat
        this.TIME_SIGNATURE = 4;                                     // time signature
        this.SONG_DELAY = this.songInfo[this.SONG].startdelay;       // the error between when the mp3 plays and the actual song starts
        this.PICKUP_BEATS = this.songInfo[this.SONG].pickupbeats;    // how many pick up beats there are
        
        this.lastBeat = 0;                  // current beat of the measure
        this.currentBeatContinuous = 2;     // elapsed beats with decimals

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;
        this.totalScore = 0;

        this.spawnIndex = 0;
        this.activeEntities = [];
        this.scheduledCueBeats = [];

        this.notes.forEach(note => {

            note.spawned = false;

        });

        this.initialized = false;

        this.createMusic();
        this.createAnimations();
        this.createScene();

        // this.backButton = this.add.text(
        //     this.SCREEN_WIDTH * 0.05,
        //     this.SCREEN_HEIGHT * 0.05,
        //     `<- Back`)
        //     .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
        //     .setOrigin(0, 0)
        //     .setInteractive({useHandCursor: true})
        //     .on('pointerdown', () => {
        //         this.game.sound.stopAll();
        //         this.changeScene('levelselectprototype');
        //     })

        this.pauseButton = this.add.image(
            this.SCREEN_WIDTH * 0.01,
            this.SCREEN_HEIGHT * 0.01,
            "pause")
            .setOrigin(0, 0)
            .setScale(0.05)
            .setDepth(10000)
            .setAlpha(0.5)
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.game.sound.pauseAll();
                this.scene.pause();
                this.scene.launch('pausescene'); 
            })
        
        // On user input
        this.input.removeAllListeners('pointerdown');
        this.input.on('pointerdown', () => {

            this.handleInput();

        });

    }



    update() {

        this.updateTimestamps();
        this.updateEntities();
        this.spawnEntities();
        this.playBeatEvents();
        this.playCueEvents();

    }



    createMusic() {

        // Add Music
        this.music = this.sound.add(`${this.songInfo[this.SONG].name}`);
        this.perfectOkSFX = this.sound.add('perfectok');
        this.missSFX = this.sound.add('miss');
        
        this.entityCueSFX = {

            cow: this.sound.add("cow"),
            human: this.sound.add("human"),
            ghost: this.sound.add("ghost")

        };

        this.musicStarted = false;

        this.music.once('complete', () => {

            this.fade(true, this.FADE_DURATION);
            this.time.delayedCall(this.FADE_DURATION, () => {

                this.scene.start('evaluationscene', { score: this.totalScore, level: 3 });

            });
            

        });

    }



    createAnimations() {

        if (!this.anims.exists("walk")) {

            this.anims.create({

                key: "walk",
                frames: this.anims.generateFrameNumbers("walking", {
                    start: 0,
                    end: 4
                }),
                frameRate: this.BPM / 20,
                repeat: -1,
                    
            });

        }

        if (!this.anims.exists("spin")) {

            this.anims.create({

                key: "spin",
                frames: this.anims.generateFrameNumbers("belt", {
                    start: 0,
                    end: 3
                }),
                frameRate: this.BPM / 20,
                repeat: -1,
                
            });

        }

        if (!this.anims.exists("ghostwalk")) {

            this.anims.create({

                key: "ghostwalk",
                frames: this.anims.generateFrameNumbers("ghostwalk", {
                    start: 0,
                    end: 1
                }),
                frameRate: this.BPM / 15,
                repeat: -1,
                
            });

        }

        if (!this.anims.exists("cowwalk")) {

            this.anims.create({

                key: "cowwalk",
                frames: this.anims.generateFrameNumbers("cowwalk", {
                    start: 0,
                    end: 2
                }),
                frameRate: this.BPM / 20,
                repeat: -1,
                
            });

        }

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
            "Gameplay prototype v2")
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

        this.numericScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.13,
            `Score: ${this.totalScore}`)
            .setStyle({ fontSize: `16px`, color: '#D3D3D3' })
            .setOrigin(0.5, 0.5);

    }



    createUfo() {

        this.ufo = this.add.sprite(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.2,
            "ufo")
            .setOrigin(0.5, 0.5)
            .setDepth(10)
            .setScale(0.25);

        let ufofx1 = this.ufo.enableFilters().filters.external.addGlow(0xffff00, 2, 0, 1, false, 10, 32);
        let ufofx2 = this.ufo.enableFilters().filters.external.addGlow(0xff0000, 2, 2);

        this.triangle = this.add.triangle(
            this.ufo.x,        // object x
            this.SCREEN_HEIGHT * 0.55,       // object y
            0, 0,                           // top vertex
            -50, 475,                      // bottom left
            50, 475,                       // bottom right
            0xFFFF00,
        ).setOrigin(0, 0.5);

        this.triangle.setAlpha(0);

    }



    createBackground() {

        this.background = this.add.sprite(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "background")
            .setOrigin(0.5, 0.5);
            // .setTint(0x777777);

        this.expandToBorder(this.background);

        this.moon = this.add.sprite(
            this.SCREEN_WIDTH,
            0,
            "moon")
            .setOrigin(0.5, 0.5)
            .setScale(0.25)
            .setDepth(10);

        this.house = this.add.sprite(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.95,
            "house")
            .setOrigin(0.5, 1)
            .setScale(0.3)
            .setDepth(11);

        this.barn = this.add.sprite(
            this.SCREEN_WIDTH * 0.92,
            this.SCREEN_HEIGHT * 0.9,
            "barn")
            .setOrigin(0.5, 1)
            .setScale(0.3)
            .setDepth(11);

        this.fence = this.add.sprite(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.9,
            "fence")
            .setOrigin(0.5, 1)
            .setScale(0.35)
            .setDepth(100);

        // this.otherFence = this.add.sprite(
        //     this.SCREEN_WIDTH - this.fence.width,
        //     this.SCREEN_HEIGHT * 0.9,
        //     "fence")
        //     .setOrigin(0.5, 1)
        //     .setScale(0.4)
        //     .setDepth(100);

        // this.conveyor = this.add.sprite(
        //     this.SCREEN_WIDTH * 0.55,
        //     this.SCREEN_HEIGHT * 0.85,
        //     "belt")
        //     .setDepth(10)
        //     .setScale(0.2)
        //     .setOrigin(0.5, 1);

        // this.conveyor.play("spin");

    }



    createStars() {

        this.stars = this.add.group();
        this.otherStars = this.add.group();

        const STAR_COUNT = 32;

        for (let i = 1; i <= STAR_COUNT; i++) {

            if (i % 2 === 0) {

                let star = this.add.sprite(
                    this.SCREEN_WIDTH * Math.random(), 
                    (this.SCREEN_HEIGHT * 0.5 * Math.random()), 
                    "star")
                    .setScale(0.001)
                    .setAngle(Math.random() * 90);

                // star.enableFilters();
                // star.glow = star.filters.internal.addGlow(0xFFFFFF, 0);
                this.stars.add(star);

            } 
            else {

                let star = this.add.sprite(
                    this.SCREEN_WIDTH * Math.random(), 
                    (this.SCREEN_HEIGHT * 0.45 * Math.random()),
                    "star")
                    .setScale(0.001)
                    .setAngle(Math.random() * 90);

                // star.enableFilters();
                // star.glow = star.filters.internal.addGlow(0xFFFFFF, 0);
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
            this.perfectOkSFX.play({
                loop: false,
                // volume: BaseScene.masterVolume,
                volume: 0.5
            });

        } 

        else if (error <= this.OK_ERROR) {

            this.judgement.setText("Ok");
            this.judgement.setStyle({ color: "#228B22"});
            evaluation = "ok";
            this.perfectOkSFX.play({
                loop: false,
                // volume: BaseScene.masterVolume,
                volume: 0.5
            });

        } 

        else {

            this.judgement.setText("miss");
            this.judgement.setStyle({ color: "#D2D2D2"});
            evaluation = "miss";
            this.missSFX.play({
                loop: false,
                // volume: BaseScene.masterVolume,
                volume: 0.5
            });

        }

        this.flashJudgement();

        return evaluation;

    }



    applyScore(rating) {

        switch(rating) {

            case("perfect!"):

                this.perfectCount++;
                this.totalScore += this.perfectPoints;

                this.perfectScore.setText(`Perfect: ${this.perfectCount}`);
                this.numericScore.setText(`Score: ${Math.ceil(this.totalScore)}`);
                break;

            case("ok"):

                this.okCount++;
                this.totalScore += this.okPoints;

                this.okScore.setText(`Ok: ${this.okCount}`);
                this.numericScore.setText(`Score: ${Math.ceil(this.totalScore)}`);
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

        this.lastInput.setText(`most recent input on beat ${this.currentBeatContinuous.toFixed(2)}`);

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

        this.applyScore(rating);
        this.playUfoAnimation(rating);
        this.playAbductionAnimation(rating, entity);

        this.activeEntities = this.activeEntities.filter(e => e !== entity);

    }



    startMusic() {

        if (!this.musicStarted) {

            this.music.play({ 
                loop: false, 
                volume: BaseScene.masterVolume,
                // seek: 13,
                // seek: 75,
                // seek: 100,
                // seek: 145,
                seek: 200,
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

            let targetBeat = ((note.measure - 1) * this.TIME_SIGNATURE) + note.beat;
            let spawnBeat = targetBeat - config.anticipationBeats;

            if (this.currentBeatContinuous >= spawnBeat) {

                let entity = this.spawnEntity(note, config);

                this.activeEntities.push(entity);

                for (let cue of config.cues) {
                    this.scheduledCueBeats.push({
                        beat: targetBeat - cue.leadBeats,
                        sfx: cue.sfx,
                    });
                }

                this.spawnIndex++;

            } else {

                break;

            }

        }

    }



    spawnEntity(note, config) {

        let sprites = {
            cow: "cow",
            ghost: "ghost",
            human: "walking"
        };

        let sprite = sprites[note.type];

        let entity = this.add.sprite(
            
            this.SCREEN_WIDTH * this.ENTITY_SPAWN_LOCATION,
            this.SCREEN_HEIGHT * 0.84,
            sprite)
            .setOrigin(0.5, 1)
            .setScale(0.075);

        let spawn = this.SCREEN_WIDTH * this.ENTITY_SPAWN_LOCATION;
        let judgementZone = this.ufo.x;            // judgement zone / UFO line
        let endingZone = this.SCREEN_WIDTH * 0.2;     // house position

        let totalDistance = Math.abs(spawn - endingZone);
        let judgeDistance = Math.abs(spawn - judgementZone);

        let timeToJudge = config.anticipationBeats * this.BEAT_DURATION * 1000;
        let totalDuration = timeToJudge * (totalDistance / judgeDistance);

        // entity.x = spawn;

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
        entity.targetBeat = ((note.measure - 1) * this.TIME_SIGNATURE) + note.beat;
        // entity.judged = false;

        switch(note.type) {

            case("human"):
                entity.play("walk");
                break;

            case("ghost"):
                entity.play("ghostwalk");
                break;

            case("cow"):
                entity.play("cowwalk");
                break;
        }

        console.log(`Measure ${note.measure}, Beat ${note.beat}`)

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
        this.lastBeat = (Math.floor(this.currentBeatContinuous - this.PICKUP_BEATS) % this.TIME_SIGNATURE + this.TIME_SIGNATURE) % this.TIME_SIGNATURE;

    }



    playBeatEvents() {

        if (this.lastBeat === this.lastBeatEvent) {

            return;

        }

        this.lastBeatEvent = this.lastBeat;

        let evenBeat = (this.lastBeat % 2 == 0);

        this.updateStarShine(evenBeat);
        this.updateMoonShine(evenBeat);
        this.updateBounces();

    }



    playCueEvents() {

        if (!this.musicStarted) return;

        for (let i = this.scheduledCueBeats.length - 1; i >= 0; i--) {

            let cue = this.scheduledCueBeats[i];

            if (this.currentBeatContinuous >= cue.beat) {

                this.entityCueSFX[cue.sfx].play({
                    loop: false,
                    // volume: BaseScene.masterVolume,
                    volume: 0.35,
                    rate: 2
                });

                this.scheduledCueBeats.splice(i, 1);

            }

        }

    }



    updateMoonShine(evenBeat) {

        this.moon.setTint(evenBeat ? 0x777777 : 0xFFFFFF);
        this.moon.setScale(evenBeat ? this.MOON_SCALE - 0.01 : this.MOON_SCALE);

    }



    updateBounces() {

        this.tweens.add({

            targets: this.ufo,
            scale: this.ufo.scale * 0.95,
            duration: 50,
            yoyo: true

        });

        for (let entity of this.activeEntities) {

            if (entity) {

                this.tweens.add({

                    targets: entity,
                    scale: entity.scale * 0.8,
                    duration: 50,
                    yoyo: true

                });

            }

        }

    }



    updateStarShine(evenBeat) {

        this.stars.getChildren().forEach(star => {

            star.setAlpha(evenBeat ? 1 : 0.3);
            star.setScale(evenBeat ? 0.02 : 0.01);
            // this.tweens.add({

            //         targets: star,
            //         scale: (evenBeat ? 0.02 : 0.01),
            //         duration: 50,
            //         alpha: (evenBeat ? 1 : 0.3),
            //         yoyo: false

            //     });

        });

        this.otherStars.getChildren().forEach(star => {

            star.setAlpha(evenBeat ? 0.3 : 1);
            star.setScale(evenBeat ? 0.01 : 0.02);
            // this.tweens.add({

            //         targets: star,
            //         scale: (evenBeat ? 0.3 : 1),
            //         duration: 50,
            //         alpha: (evenBeat ? 0.01 : 0.02),
            //         yoyo: false

            //     });

        });
        
    }



}