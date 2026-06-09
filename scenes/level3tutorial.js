/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class Level3Tutorial extends BaseScene {



    constructor() {

        super("level3tutorial");

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

                anticipationBeats: 3,
                cues: [
                    { leadBeats: 2, sfx: "human"},
                    { leadBeats: 1.5, sfx: "human"},
                    { leadBeats: 1, sfx: "cow"}
                ]

            },

            ghost: {

                anticipationBeats: 2,
                cues: [
                    { leadBeats: 2.5, sfx: "human"},
                    { leadBeats: 1.5, sfx: "human"},
                    { leadBeats: 1, sfx: "ghost"},
                ]

            }

        };

        this.ENTITY_SPAWN_LOCATION = 1;

        this.ERROR_MARGIN = 0.75;
        this.OK_ERROR = 0.25;
        this.PERFECT_ERROR = 0.1;

        this.MOON_SCALE = 0.2;

    }



    preload() {

        this.load.json("score", "../assets/beatmaps/level3score.json");
        this.load.pack("main", "../assets/level3assets.json");

    }



    onEnter() {

        this.sound.removeAll();

        this.score = this.cache.json.get("score");
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
                    "I have come to abduc- AHH! er- I mean GATHER materials for my \"experiments\"!",
                    "However, I do need your help...",
                    "You will have to signal me with a click anywhere on the screen when a target is underneath my ship.",
                    "Let's do some practice first!",
                    "Oh look! Here comes a potential subject!",
                    "Don't try to time with your eyes! Use your ears and tap to the beat!"
                ]
            },

            {
                type: "human",
                hitsNeeded: 1,
                dialogue: [
                    "Oh look! Here comes a potential subject!"
                ]
            },

            {
                type: "cow",
                hitsNeeded: 1,
                dialogue: [
                    "Nice! That's the way.",
                    "Oh! It looks like something else is approaching!"
                ]
            },

            {
                type: "ghost",
                hitsNeeded: 1,
                dialogue: [
                    "Excellent work!",
                    "Now let's try this one"
                ]
            },

            {
                type: null,
                hitsNeeded: 0,
                dialogue: [
                    "All right.",
                    "Let's do it for real now!"
                ],
                final: true
            }
        ];

        this.currentDialogue = this.practicePhases[this.practicePhase].dialogue;
        this.dialogueIndex = 0;

        this.activeEntities = [];
        this.scheduledCueBeats = [];

        this.createMusic();
        this.createAnimations();
        this.createScene();

        this.input.removeAllListeners("pointerdown");
        this.input.on("pointerdown", () => {
            this.handleInput();
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



    handleInput() {

        if (this.tutorialEnding) return;

        if (this.tutorialPhase == 0) {

            this.advanceDialogue();
            this.missSFX.play({
                rate: 5
            })
            return;

        }

        this.startMusic();

        let entity = this.getClosestEntity();
        if (!entity) return;

        let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

        if (error > this.ERROR_MARGIN) {

            this.playUfoAnimation("miss");
            return;

        }

        let rating = this.getJudgement(error);

        this.applyScore(rating);
        this.playUfoAnimation(rating);
        this.playAbductionAnimation(rating, entity);

        this.activeEntities = this.activeEntities.filter(e => e !== entity);

    }
    


    createScene() {

        this.createBackground();
        this.createUfo();
        this.createTutorialText();
        this.createSkipTutorial();
        this.createFocusBorder();
        this.createPauseButton();

    }



    createTutorialText() {

        this.tutorialText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.9,
            "Greetings Earthling!",
            {
                fontSize: "16px",
                color: "#000000",
                backgroundColor: "#FFFFFF",
                align: "center",
                padding: { x: 20, y: 15 },
                wordWrap: { 
                    width: this.SCREEN_WIDTH * 0.4
                }
            }
        )
        .setOrigin(0.5, 0.5)
        .setDepth(1000);

    }



    createSkipTutorial() {

        this.skipTutorial = this.add.text(
            this.SCREEN_WIDTH * 0.01, 
            this.SCREEN_HEIGHT * 0.9, 
            "Skip Tutorial",
            {
                fontSize: "16px",
                color: "#000000",
                backgroundColor: "#FFFFFF",
                align: "center",
                padding: { x: 20, y: 15 },
                wordWrap: { 
                    width: this.SCREEN_WIDTH * 0.4
                }
            }
        )
        .setOrigin(0, 0.5)
        .setDepth(1000)
        .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.changeScene('level3');
            });

    }



    createBackground() {

        this.house = this.add.sprite(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.95,
            "house"
        )
        .setOrigin(0.5, 1)
        .setScale(0.3)
        .setDepth(10);

        this.barn = this.add.sprite(
            this.SCREEN_WIDTH * 0.92,
            this.SCREEN_HEIGHT * 0.9,
            "barn"
        )
        .setOrigin(0.5, 1)
        .setScale(0.3)
        .setDepth(10);

    }



    createUfo() {

        this.ufo = this.add.sprite(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.2,
            "ufo"
        )
        .setOrigin(0.5, 0.5)
        .setDepth(10)
        .setScale(0.25);

        this.ufo.enableFilters().filters.external.addGlow(
            0xffff00,
            2,
            0,
            1,
            false,
            10,
            32
        );

        this.ufo.enableFilters().filters.external.addGlow(
            0xff0000,
            2,
            2
        );

        this.triangle = this.add.triangle(
            this.ufo.x,
            this.SCREEN_HEIGHT * 0.55,
            0, 0,
            -50, 475,
            50, 475,
            0xFFFF00
        )
        .setOrigin(0, 0.5);

        this.triangle.setAlpha(0);

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
                repeat: -1
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
                repeat: -1
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
                repeat: -1
            });
        }

    }



    createMusic() {

        if (BaseScene.currentMusic) BaseScene.currentMusic.stop();
        this.music = this.sound.add(`${this.songInfo[this.SONG].name}`);
        BaseScene.currentMusic = this.music;
        this.metronome = this.sound.add("metronome");
        this.perfectOkSFX = this.sound.add('perfectok');
        this.missSFX = this.sound.add('miss');

        this.entityCueSFX = {

            cow: this.sound.add("cow"),
            human: this.sound.add("human"),
            ghost: this.sound.add("ghost"),

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



    stopMusic() {

        if (this.music && this.musicStarted) {

            this.music.stop();
            this.musicStarted = false;

        }

        if (this.metronome) {

            this.metronome.stop();

        }

    }



    createPauseButton() {

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
                this.scene.launch('pausescene', { level: this.scene.key }); 
            })

    }



    createFocusBorder() {

        this.top = this.add.rectangle(
            0,
            this.ufo.y * 0.1,
            this.SCREEN_WIDTH,
            this.SCREEN_HEIGHT,
            0x000000
        ).setOrigin(0, 1).setDepth(100);

        this.bottom = this.add.rectangle(
            0,
            this.ufo.y * 1.9,
            this.SCREEN_WIDTH,
            this.SCREEN_HEIGHT,
            0x000000
        ).setOrigin(0, 0).setDepth(100);

        this.left = this.add.rectangle(
            this.ufo.x * 0.6,
            0,
            this.SCREEN_WIDTH,
            this.SCREEN_HEIGHT,
            0x000000
        ).setOrigin(1, 0).setDepth(100);

        this.right = this.add.rectangle(
            this.ufo.x * 1.4,
            0,
            this.SCREEN_WIDTH,
            this.SCREEN_HEIGHT,
            0x000000
        ).setOrigin(0, 0).setDepth(100);

        this.focusBorderPieces = [

            this.top,
            this.bottom,
            this.left,
            this.right

        ];

    }



    expandFocusBorder() {

        this.tweens.add({
            targets: this.top,
            y: -100,
            duration: 1000,
            ease: "Sine.easeIn"
        });

        this.tweens.add({
            targets: this.bottom,
            y: this.SCREEN_HEIGHT + 100,
            duration: 1000,
            ease: "Sine.easeIn"
        });

        this.tweens.add({
            targets: this.left,
            x: -100,
            duration: 1000,
            ease: "Sine.easeIn"
        });

        this.tweens.add({
            targets: this.right,
            x: this.SCREEN_WIDTH + 100,
            duration: 1000,
            ease: "Sine.easeIn",
            onComplete: () => {
                this.focusBorderPieces.forEach(piece => piece.destroy());
            }
        });

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
        if (this.focusBorderPieces.length > 0 ) this.expandFocusBorder();
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
            `${phase.hitsNeeded} more time(s)`
        );

        this.startMusic();

    }



    finishTutorial() {

        if (this.tutorialEnding) return;
        this.tutorialEnding = true;
        this.game.sound.stopAll();

        this.time.delayedCall(this.FADE_DURATION * 2, () => {

            this.changeScene("level3");

        });

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
                type: type
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

        this.stopMusic();

        this.practicePhase++;

        let phase = this.practicePhases[this.practicePhase];

        this.dialogueIndex = 0;
        this.currentDialogue = phase.dialogue;
        this.tutorialPhase = 0;

        this.time.delayedCall(1500, () => {
            this.advanceDialogue();
        });

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
            sprite
        )
        .setOrigin(0.5, 1)
        .setScale(0.075);

        let spawn = this.SCREEN_WIDTH * this.ENTITY_SPAWN_LOCATION;
        let judgementZone = this.ufo.x;
        let endingZone = this.SCREEN_WIDTH * 0.2;

        let totalDistance = Math.abs(spawn - endingZone);
        let judgeDistance = Math.abs(spawn - judgementZone);

        let timeToJudge = config.anticipationBeats * this.BEAT_DURATION * 1000;
        let totalDuration = timeToJudge * (totalDistance / judgeDistance);

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

        switch(note.type) {

            case("human") :

                entity.play("walk");
                break;

            case("ghost") :

                entity.play("ghostwalk");
                break;

            case("cow") :

                entity.play("cowwalk");
                break;
        }

        return entity;

    }



    updateEntities() {

        for (let i = this.activeEntities.length - 1; i >= 0; i--) {

            let entity = this.activeEntities[i];

            if (this.currentBeatContinuous > entity.targetBeat + this.ERROR_MARGIN) {

                this.activeEntities.splice(i, 1);

                this.getJudgement(999);
                this.applyScore("miss");

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



    getJudgement(error) {

        let evaluation = "";

        if (error <= this.PERFECT_ERROR) {

            evaluation = "perfect!";
            this.perfectOkSFX.play({
                loop: false,
                volume: BaseScene.masterVolume,
                // volume: 1
            });

        } 
        
        else if (error <= this.OK_ERROR) {

            evaluation = "ok";
            this.perfectOkSFX.play({
                loop: false,
                volume: BaseScene.masterVolume,
                // volume: 1
            });

        } 

        else {

            evaluation = "miss";
            this.missSFX.play({
                loop: false,
                volume: BaseScene.masterVolume,
                // volume: 1
            });

        }

        return evaluation;

    }



    applyScore(rating) {

        if (rating == "perfect!") {

            this.practiceHits++;
            let currentPhase = this.practicePhases[this.practicePhase];
            this.tutorialText.setText(`${this.practicePhases[this.practicePhase].hitsNeeded - this.practiceHits} more time(s)`);

            if (this.practiceHits >= currentPhase.hitsNeeded) {

                this.advancePracticePhase();

            }
            
        }

    }



    playUfoAnimation(rating) {

        this.tweens.killTweensOf(this.triangle);
        this.triangle.setAlpha(0.3);
        let colorRating = 0xFFFF00;

        switch (rating) {

            case ("perfect!"):

                colorRating = 0x00FF00;
                break;

            case ("ok"):

                colorRating = 0xFFFF00;
                break;

            case ("miss"):

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
        });

    }



    playAbductionAnimation(rating, entity) {

        switch (rating) {

            case ("perfect!"):

                this.tweens.killTweensOf(entity);

                this.tweens.add({
                    targets: entity,
                    duration: 300,
                    x: this.ufo.x,
                    y: this.ufo.y,
                    scale: 0,
                    onComplete: () => entity.destroy()
                });

                break;

            case ("ok"):

                this.tweens.killTweensOf(entity);

                this.tweens.add({
                    targets: entity,
                    duration: 700,
                    x: this.ufo.x,
                    y: this.ufo.y,
                    angle: 360,
                    scale: 0,
                    onComplete: () => entity.destroy()
                });

                break;

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

        this.updateBounces();

    }



    playCueEvents() {

        if (!this.musicStarted) return;

        for (let i = this.scheduledCueBeats.length - 1; i >= 0; i--) {

            let cue = this.scheduledCueBeats[i];

            if (this.currentBeatContinuous >= cue.beat) {

                if (cue.sfx == "ghost") {

                    this.entityCueSFX[cue.sfx].play({
                    loop: false,
                    volume: BaseScene.masterVolume * 0.5,
                    // volume: 0.35,
                    rate: 1

                });

                }

                else {

                    this.entityCueSFX[cue.sfx].play({
                        loop: false,
                        volume: BaseScene.masterVolume,
                        // volume: 0.35,
                        rate: 2
                    });

                }

                this.scheduledCueBeats.splice(i, 1);

            }

        }

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

}