/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class TutorialPrototype2 extends BaseScene {



    constructor() {

        super("tutorial2");

        /*
            jubeatb2b = 0
            paranoia = 1
            bossa = 2
        */
        this.SONG = 0;

        this.ENTITY_SPAWN_CONFIG = {
            left_high: 0,
            right_high: 1,
            left_mid: 2,
            right_mid: 3,
            left_low: 4,
            right_low: 5
        }

        this.ENTITY_TYPE_CONFIG = {
            friend: 1,
            enemy: 0
        }

        this.ENTITY_TIMING_CONFIG = {

            enemy: {
                spawn: "left_high",
                type: "enemy",
                anticipationBeats: 4,
                cues: [
                    { sfx: "enemy"},
                ]

            },
            enemy2: {
                spawn: "right_mid",
                type: "enemy",
                anticipationBeats: 4,
                cues: [
                    { sfx: "enemy"},
                ]

            },

            friend: {
                spawn: "left_high",
                type: "friend",
                anticipationBeats: 4,
                cues: [
                    { sfx: "friend"}
                ]

            },

        };

        this.ENTITY_SPAWN_LOCATION = 1;

        this.ERROR_MARGIN = 0.75;
        this.OK_ERROR = 0.25;
        this.PERFECT_ERROR = 0.1;

        this.MOON_SCALE = 0.2;

    }



    preload() {

        this.load.audio("metronome", "../assets/audio/SFX/level3/metronome.mp3")
        this.load.audio('suspicious', '../assets/audio/songs/suspicious.mp3');

        this.load.audio('enemySpawnSoundEffect', '../assets/audio/SFX/level2/enemySpawn.wav');
        this.load.audio('friendSpawnSoundEffect', '../assets/audio/SFX/level2/friendSpawn.wav');
        this.load.audio('laser', '../assets/audio/SFX/level2/laser.wav');

        this.load.json('score_suspicious', '../assets/beatmaps/score_suspicious.json');

        this.load.image('pause', '../assets/images/menu/pause.png');
        this.load.spritesheet('explosion', "../assets/images/level2/explosion_particle.png", { frameWidth: 32, frameHeight: 32});
        this.load.image('angry_alien', '../assets/images/level2/angry_alien.png');
        this.load.image('friendly_alien', '../assets/images/level2/friendly_alien.png');
        this.load.image('crosshair', '../assets/images/level2/crosshair.png')

    }



    onEnter() {

        this.sound.removeAll();

        this.judgement = Object.freeze({
            PERFECT: 0,
            OK: 1,
            MISS: 2,
            FRIENDLY_FIRE: 3
        });


        this.scaleFactor = 4;
        this.scrollSpeed = 1;

        this.score = this.cache.json.get("score_suspicious");
        this.songInfo = this.score.song;

        this.BPM = this.songInfo[this.SONG].bpm * 0.75;
        this.BEAT_DURATION = 60 / this.BPM;
        this.TIME_SIGNATURE = 4;
        this.SONG_DELAY = this.songInfo[this.SONG].startdelay;
        this.PICKUP_BEATS = this.songInfo[this.SONG].pickupbeats;

        this.lastBeat = 0;
        this.lastBeatEvent = null;
        this.currentBeatContinuous = 0;
        this.musicPosition = 0;

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;

        this.practicePhase = 0;
        this.practiceHits = 0;
        this.nextTargetBeat = 5;

        this.tutorialPhase = 0;
        this.tutorialEnding = false;

        this.practicePhases = [

            {
                type: null,
                hitsNeeded: 0,
                dialogue: [
                    "Glorputations my friend!",
                    "Huh? You don't know how you got here? Haha very funny, in that case I don't either!",
                    "But now is not the time for jokes,",
                    "We're at war!",
                    "Shoot any UFO's with a red stripe on sight!",
                    "But be careful, your allies are here too! They have a blue stripe like me, make sure not to shoot them!",
                    "Huh? You've never fired your laser cannon before? It's easy! Just click anywhere to fire!",
                    "Make sure the enemy is at that red line in the center of your crosshair for the best results!"
                ]
            },

            {
                type: "enemy",
                hitsNeeded: 1,
                spawn: 0,
                dialogue: [
                    "I see an enemy approaching now, give it a try!"
                ]
            },

            {
                type: "friend",
                hitsNeeded: 1,
                spawn: 0,
                dialogue: [
                    "Nice job!",
                    "Oh no way, thats Gleremy, make sure to let him through!"
                ]
            },

            {
                type: "enemy2",
                hitsNeeded: 1,
                dialogue: [
                    "See ya later Gleremy!",
                    "Watch out! Don't forget that enemies can come from different angles!"
                ]
            },

            {
                type: null,
                hitsNeeded: 1,
                dialogue: [
                    "All right.",
                    "Good luck solder! Do Glorpulon 5 proud!"
                ],
                final: true
            }
        ];

        this.currentDialogue = this.practicePhases[this.practicePhase].dialogue;
        this.dialogueIndex = 0;

        this.activeEntities = [];
        this.scheduledCueBeats = [];

        this.createMusic();
        this.createScene();

        this.cameras.main.setBackgroundColor('#010B19');


        this.cursor = this.add.image(
            this.SCREEN_WIDTH * 0.5, 
            this.SCREEN_HEIGHT * 0.5, 
            'crosshair')
            .setOrigin(0.5, 0.5)
            .setDepth(1)
            .setScale(7);

        this.friendlyAlien = this.add.image(700, this.SCREEN_HEIGHT * .75, 'friendly_alien').setScale(7);
        this.tweens.add({ 
            targets: this.friendlyAlien,
            y: this.SCREEN_HEIGHT * .77,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });


        this.spawnPoints = this.add.group();
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .3));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .3));
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .5));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .5));
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .7));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .7));
        this.laserSpawnLeft = this.add.container(this.SCREEN_WIDTH * .25, this.SCREEN_HEIGHT);
        this.laserSpawnRight = this.add.container(this.SCREEN_WIDTH * .75, this.SCREEN_HEIGHT);

        this.backButton = this.add.text(
            this.SCREEN_WIDTH * 0.05,
            this.SCREEN_HEIGHT * 0.05,
            "<- Back"
        )
        .setStyle({ fontSize: "32px", color: "#FFFFFF" })
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
            this.game.sound.stopAll();
            this.changeScene("levelselectprototype");
        });

        this.input.removeAllListeners("pointerdown");
        this.input.on("pointerdown", () => {
            this.handleInput();
        });

        this.input.keyboard.on("keydown-SPACE", () => {
            this.handleInput();
        });

        if (!this.anims.exists('explosion')) {
            this.anims.create({
                key: 'explosion',
                frames: this.anims.generateFrameNumbers('explosion', {start: 0, end: 2}),
                frameRate: 6,
            });
        }

        this.explosionEmitter = this.add.particles(0, 0, 'explosion', {
            lifespan: 500,
            anim: 'explosion',
            scale: 3,
            alpha: { start: 1, end: .7},
            emitting: false
        });
    }



    update() {

        if (!this.music) return;

        this.updateTimestamps();

        if (this.tutorialPhase == 1) {
            this.updateEntities();
            this.spawnEntities();
            this.playCueEvents();
        }

        this.playBeatEvents();

    }



    createMusic() {

        this.music = this.sound.add(`${this.songInfo[this.SONG].name}`);
        this.metronome = this.sound.add("metronome");
        this.laser = this.sound.add('laser');

        this.entityCueSFX = {

            cow: this.sound.add("friendSpawnSoundEffect"),
            human: this.sound.add("enemySpawnSoundEffect")

        };

        this.musicStarted = false;

    }



    startMusic() {

        if (!this.musicStarted) {

            this.music.play({
                loop: false,
                volume: 0,
                rate: 1
            });

            this.musicStarted = true;

        }

    }



    handleInput() {

        if (this.tutorialEnding) return;

        if (this.tutorialPhase == 0) {

            this.advanceDialogue();
            return;

        }

        this.startMusic();

        let entity = this.getClosestEntity();
        if (!entity) return;

        let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

        if (error > this.ERROR_MARGIN) {

            return;

        }

        let rating = this.getJudgement(error, entity);

        this.applyScore(rating);

        this.tutorialText.setText(`${this.practicePhases[this.practicePhase].hitsNeeded - this.practiceHits} more time(s).`);

    }



    advanceDialogue() {

        let phase = this.practicePhases[this.practicePhase];

        if (this.dialogueIndex < phase.dialogue.length) {

            this.tutorialText.setText(
                phase.dialogue[this.dialogueIndex]
            );

            this.dialogueIndex++;
            return;

        }

        if (phase.final) {

            this.finishTutorial();
            return;

        }

        if (phase.type == null) {

            this.practicePhase++;
            this.currentDialogue = this.practicePhases[this.practicePhase].dialogue;
            this.dialogueIndex = 0;

        }

        this.startPracticePhase();

    }



    startPracticePhase() {

        let phase = this.practicePhases[this.practicePhase];

        this.tutorialPhase = 1;

        this.practiceHits = 0;
        this.nextTargetBeat = 5;

        this.currentBeatContinuous = 0;
        this.musicPosition = 0;

        this.tutorialText.setText(
            `${phase.hitsNeeded} more time(s).`
        );

        this.startMusic();

    }



    finishTutorial() {

        if (this.tutorialEnding) return;
        this.tutorialEnding = true;
        this.game.sound.stopAll();

        this.time.delayedCall(this.FADE_DURATION * 2, () => {

            this.changeScene("gameplayprototype5");

        });

    }



    createScene() {
        this.createText();
        this.createTutorialText();

    }



    createTutorialText() {

        this.tutorialText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.9,
            "",
            {
                fontSize: "16px",
                color: "#000000",
                backgroundColor: "#FFFFFF",
                align: "center",
                padding: { x: 20, y: 15 },
                wordWrap: { 
                    width: this.SCREEN_WIDTH * 0.3
                }
            }
        )
        .setOrigin(0.5, 0.5)
        .setDepth(1000);

    }

    createText() {
        
        this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.05,
            "Tutorial prototype v1"
        )
        .setStyle({ fontSize: "16px", color: "#ff5757" })
        .setOrigin(0.5, 0.5);

        this.lastInput = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.9,
            ""
        )
        .setStyle({ fontSize: "32px", color: "#FFFFFF" })
        .setOrigin(0.5, 0.5);

        this.judgementText= this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            ""
        )
        .setStyle({
            fontSize: "64px",
            color: "#FFFFFF",
            fontStyle: "bold"
        })
        .setOrigin(0.5, 0.5);

        this.perfectScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.04,
            `Hits: ${this.perfectCount}`
        )
        .setStyle({ fontSize: "16px", color: "#FFD700" })
        .setOrigin(0.5, 0.5);

        this.okScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.07,
            `Ok: ${this.okCount}`
        )
        .setStyle({ fontSize: "16px", color: "#228B22" })
        .setOrigin(0.5, 0.5);

        this.missScore = this.add.text(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.1,
            `Miss: ${this.missCount}`
        )
        .setStyle({ fontSize: "16px", color: "#D3D3D3" })
        .setOrigin(0.5, 0.5);

    }

    updateTimestamps() {

        this.musicPosition = this.music.seek - this.SONG_DELAY;
        this.currentBeatContinuous = this.musicPosition / this.BEAT_DURATION;

        this.lastBeat =
            (
                Math.floor(this.currentBeatContinuous - this.PICKUP_BEATS)
                % this.TIME_SIGNATURE
                + this.TIME_SIGNATURE
            )
            % this.TIME_SIGNATURE;

    }



    spawnEntities() {

        if (this.tutorialPhase != 1) return;

        let phase = this.practicePhases[this.practicePhase];
        let type = phase.type;
        let config = this.ENTITY_TIMING_CONFIG[type];

        let spawnBeat = this.nextTargetBeat - config.anticipationBeats;

        while (this.currentBeatContinuous >= spawnBeat) {

            let note = {
                measure: 1,
                beat: this.nextTargetBeat,
                type: type,
                
            };

            let entity = this.spawnEntity(note, config);

            entity.targetBeat = this.nextTargetBeat;
            this.activeEntities.push(entity);

            for (let cue of config.cues) {
                this.scheduledCueBeats.push({
                    beat: this.nextTargetBeat - cue.leadBeats,
                    sfx: cue.sfx,
                });
            }

            this.nextTargetBeat += 4;

            spawnBeat = this.nextTargetBeat - config.anticipationBeats;
        }
    }



    advancePracticePhase() {

        this.stopPracticeMusic();

        this.practicePhase++;

        let phase = this.practicePhases[this.practicePhase];

        this.dialogueIndex = 0;
        this.currentDialogue = phase.dialogue;

        this.tutorialPhase = 0;

    }



    spawnEntity(note, config) {
        const spawn = this.ENTITY_SPAWN_CONFIG[config.spawn];
        const type = this.ENTITY_TYPE_CONFIG[config.type];

        const entityList = ["angry_alien", "friendly_alien"];
        let entity = this.add.image(
            this.spawnPoints.getChildren()[spawn].x,
            this.spawnPoints.getChildren()[spawn].y,
            entityList[type]
        ).setScale(this.scaleFactor).setOrigin(.5, .5);
        entity.enemy = type;
        // left spawn
        if (entity.enemy === 0) {
            this.sound.play('enemySpawnSoundEffect');
        }
        else {
            this.sound.play('friendSpawnSoundEffect');
        }
        if (spawn % 2 == 0) {
            entity.spawnedFromLeft = true;
            this.tweens.add({
                targets: entity,
                duration: 50,
                x: 10 + entity.width / 2,
                ease: 'Sine.Out',
                onComplete: () => {
                    this.tweens.add({
                        targets: entity,
                        duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000 - 50,
                        x: this.SCREEN_WIDTH / 2,
                        onComplete: () => {
                            this.tweens.add({
                                targets: entity,
                                x: this.SCREEN_WIDTH + 20,
                                duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000,
                                onComplete: () => {
                                    entity.destroy();
                                }

                            })
                        }
                    })
                }
            })
        }
        else {
            this.tweens.add({
                targets: entity,
                duration: 50,
                x: this.SCREEN_WIDTH - 10 + entity.width / 2,
                ease: 'Sine.Out',
                onComplete: () => {
                    this.tweens.add({
                        targets: entity,
                        duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000 - 50 , // x2 because they're gonna cross the entire screen
                        x: this.SCREEN_WIDTH / 2,
                        onComplete: () => {
                            this.tweens.add({
                                targets: entity,
                                x:  -20,
                                duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000,
                                onComplete: () => {
                                    entity.destroy();
                                }

                            })
                        }
                    })
                }
            })
        }

        entity.noteType = note.type;
        entity.targetBeat = ((note.measure - 1) * this.TIME_SIGNATURE) + note.beat;
        entity.judged = false;

        return entity;

    }



    updateEntities() {

        for (let i = this.activeEntities.length - 1; i >= 0; i--) {

            let entity = this.activeEntities[i];

            if (this.currentBeatContinuous > entity.targetBeat + this.ERROR_MARGIN) {
                this.activeEntities.splice(i, 1);

                this.getJudgement(null, entity);

                if (entity.enemy === 0) {
                    this.applyScore("miss");
                }
                if (entity.enemy === 1) {
                    this.applyScore("perfect!")
                }

            }
        }
    }



    getClosestEntity() {

        let closest = null;
        let closestError = null;

        for (let entity of this.activeEntities) {

            let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

            if (closestError == null || error < closestError) {

                closest = entity;
                closestError = error;

            }

        }

        return closest;

    }



    getJudgement(error, entity) {

        let evaluation = "";
        if (error === null && entity.enemy === 0) {
            this.flashJudgement(this.judgement.MISS);
            evaluation = "miss";
        }
        else if (error <= this.PERFECT_ERROR && entity.enemy === 0) {
            this.flashJudgement(this.judgement.PERFECT);
            this.shootLaser(this.judgement.PERFECT, entity);
            evaluation = "perfect!";

        } 
        else if (error == null && entity.enemy === 1) {
            this.flashJudgement(this.judgement.PERFECT);
            evaluation = "perfect!";
        }
        else if ((error != null && error <= this.OK_ERROR) && entity.enemy === 1) {
            this.flashJudgement(this.judgement.FRIENDLY_FIRE);
            this.shootLaser(this.judgement.FRIENDLY_FIRE, entity);
            evaluation = "miss";
        }
        else if (error <= this.OK_ERROR && entity.enemy == 0) {
            this.flashJudgement(this.judgement.OK);
            this.shootLaser(this.judgement.OK, entity);
            evaluation = "ok";

        } 
        else {
            this.flashJudgement(this.judgement.MISS);
            this.shootLaser(this.judgement.MISS, entity);
            evaluation = "miss";
        }

        return evaluation;

    }

    shootLaser(judgement, entity) {
        console.log(judgement);
        let laser = this.add.graphics();
        laser.lineStyle(3, 0xd02b14, 1);
        laser.beginPath();

        this.sound.play('laser', { volume: 0.1 });
        this.cameras.main.shake(200, .005);

        switch (judgement) {
            case 0:
                if (entity.spawnedFromLeft) {
                    laser.moveTo(this.laserSpawnLeft.x, this.laserSpawnLeft.y);
                    laser.lineTo(entity.x, entity.y);
                } else {
                    laser.moveTo(this.laserSpawnRight.x, this.laserSpawnRight.y);
                    laser.lineTo(entity.x, entity.y);
                }
                this.explode(entity);
                break;
            case 1:
                if (entity.spawnedFromLeft) {
                    laser.moveTo(this.laserSpawnLeft.x, this.laserSpawnLeft.y);
                    laser.lineTo(entity.x, entity.y);
                } else {
                    laser.moveTo(this.laserSpawnRight.x, this.laserSpawnRight.y);
                    laser.lineTo(entity.x, entity.y);
                }
                this.explode(entity);
                break;
            case 2:
                if (entity.spawnedFromLeft) {
                    laser.moveTo(this.laserSpawnLeft.x, this.laserSpawnLeft.y);
                    laser.lineTo(this.cursor.x, entity.y);
                } 
                else {
                    laser.moveTo(this.laserSpawnRight.x, this.laserSpawnRight.y);
                    laser.lineTo(this.cursor.x, entity.y);
                }
                break;
            case 3:
                if (entity.spawnedFromLeft) {
                    laser.moveTo(this.laserSpawnLeft.x, this.laserSpawnLeft.y);
                    laser.lineTo(entity.x, entity.y);
                    this.explode(entity);
                } 
                else {
                    laser.moveTo(this.laserSpawnRight.x, this.laserSpawnRight.y);
                    laser.lineTo(entity.x, entity.y);
                    this.explode(entity);
                }

        }

        laser.strokePath();

        this.tweens.add({
            targets: laser,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                laser.destroy();
            }
        });

        this.activeEntities = this.activeEntities.filter(e => e !== entity);
    }

    explode(entity) {
        this.explosionEmitter.explode(1, entity.x, entity.y);
        if (entity.enemy === 1) {
            this.tweens.add({
                targets: entity,
                y: this.SCREEN_HEIGHT + 50,
                ease: 'Sine.In',
                onComplete: () => {
                    entity.destroy();
                }
            })
        }
        else {
            entity.destroy();
        }
    }

    applyScore(rating) {

        switch(rating) {

            case("perfect!"):
                this.practiceHits++;
                let currentPhase = this.practicePhases[this.practicePhase];
                if (this.practiceHits >= currentPhase.hitsNeeded) {
                    this.advancePracticePhase();
                };
                break;

            case("ok"):
                this.totalScore += this.okPoints;
                this.okCount++;
                break;

            case("miss"):

                this.missCount++;
                break;

            default:

                return;

        }

    }

    flashJudgement(judgement) {
        let judgementText = this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.5, "")
        .setStyle({ fontSize: `64px`, color: '#FFFFFF', fontStyle: 'bold'/*, fontFamily: "Helvetica"*/})
        .setOrigin(0.5, 0.5)
        .setDepth(2);
        switch (judgement) {
            case 0:
                judgementText.setText("PERFECT!");
                judgementText.setStyle({ color: "#FFD700"});
                break;
            case 1:
                judgementText.setText("Ok");
                judgementText.setStyle({ color: "#228B22"});
                break;
            case 2: 
                judgementText.setText("miss");
                judgementText.setStyle({ color: "#D2D2D2"});
                break;
            case 3:
                judgementText.setText("Friendly Fire!");
                judgementText.setStyle({ color: "#c46d1c"});
                break;
        }
            this.tweens.add({
                targets: judgementText,
                alpha: 0,
                scale: 0,
                x: judgementText.x - 10,
                duration: 500,
                yoyo: false,
                onComplete: () => {
                    judgementText.destroy();
                }
            });

    }



    stopPracticeMusic() {

        if (this.music && this.musicStarted) {

            this.music.stop();
            this.musicStarted = false;

        }

        if (this.metronome) {

            this.metronome.stop();

        }

    }



    playBeatEvents() {

        if (this.tutorialPhase !== 1 || !this.musicStarted) return;


        let beatNumber = Math.floor(this.currentBeatContinuous);
        if (beatNumber < 1) return;
        if (beatNumber == this.lastBeatEvent) return

        this.lastBeatEvent = beatNumber;

        if (this.metronome) {

            this.metronome.stop();

            this.metronome.play({
                loop: false,
                volume: BaseScene.masterVolume,
                rate: 1
            });

        }

        let evenBeat = beatNumber % 2 == 0;

        if (this.stars) {

            this.updateStarShine(evenBeat);

        }

        if (this.moon) {

            this.updateMoonShine(evenBeat);

        }

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
            targets: this.friendlyAlien,
            scale: this.friendlyAlien.scale * 0.95,
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

}