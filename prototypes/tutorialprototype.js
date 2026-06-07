/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class TutorialPrototype extends BaseScene {



    constructor() {

        super("tutorial");

        /*
            jubeatb2b = 0
            paranoia = 1
            bossa = 2
        */
        this.SONG = 0;

        this.ENTITY_TIMING_CONFIG = {

            human: {

                anticipationBeats: 2,
                cues: [
                    { leadBeats: 1, sfx: "human"},
                ]

            },

            cow: {

                anticipationBeats: 3,
                cues: [
                    { leadBeats: 2, sfx: "cow"},
                    { leadBeats: 1, sfx: "human"}
                ]

            },

            ghost: {

                anticipationBeats: 2,
                cues: [
                    { leadBeats: 1.5, sfx: "ghost"},
                    { leadBeats: 0.5, sfx: "human"}
                ]

            }

        };

        this.ENTITY_SPAWN_LOCATION = 0.7;

        this.ERROR_MARGIN = 0.75;
        this.OK_ERROR = 0.25;
        this.PERFECT_ERROR = 0.1;

        this.MOON_SCALE = 0.2;

    }



    preload() {

        this.load.audio("paranoia", "../assets/audio/paranoia.mp3");
        this.load.audio("jubeatb2b", "../assets/audio/jubeatb2b.mp3");
        this.load.audio("metronome", "../assets/audio/metronome.mp3")
        this.load.audio("bossa", "../assets/audio/bossa.mp3");
        this.load.audio('perfectok', '../assets/audio/perfectOk.mp3');
        this.load.audio('miss', '../assets/audio/miss.mp3');
        this.load.audio('cow', '../assets/audio/cow.mp3');
        this.load.audio('ghost', '../assets/audio/laser.wav');
        this.load.audio('human', '../assets/audio/miss.mp3');
        this.load.json("score", "../assets/score2.json");
        this.load.pack("main", "../assets/assets.json");

    }



    onEnter() {

        this.sound.removeAll();

        this.score = this.cache.json.get("score");
        this.songInfo = this.score.song;

        this.BPM = this.songInfo[this.SONG].bpm - 40;
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
                    "Greetings Earthling!",
                    "I seek research material.",
                    "However, I do need your help...",
                    "Signal me with a click anywhere on the screen when a target is underneath my ship.",
                    "Let's practice!",
                    "Oh look! Here comes a potential subject!"
                ]
            },

            {
                type: "cow",
                hitsNeeded: 4,
                dialogue: [
                    "Oh look! Here comes a potential subject!"
                ]
            },

            {
                type: "human",
                hitsNeeded: 4,
                dialogue: [
                    "Nice! That's the way.",
                    "Oh! It looks like something else is approaching!"
                ]
            },

            {
                type: "ghost",
                hitsNeeded: 4,
                dialogue: [
                    "Excellent work!",
                    "This one is approaching faster than the others. Be vigilant!"
                ]
            },

            {
                type: null,
                hitsNeeded: 1,
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

            this.playUfoAnimation("miss");
            return;

        }

        let rating = this.getJudgement(error);

        this.applyScore(rating);
        this.playUfoAnimation(rating);
        this.playAbductionAnimation(rating, entity);

        this.activeEntities = this.activeEntities.filter(e => e !== entity);

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

            this.changeScene("gameplayprototype2");

        });

    }



    createScene() {

        this.createBackground();
        this.createUfo();
        this.createStars();
        this.createText();
        this.createTutorialText();

    }



    createTutorialText() {

        this.tutorialText = this.add.text(
            this.SCREEN_WIDTH * 0.7,
            this.SCREEN_HEIGHT * 0.1,
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



    createBackground() {

        this.moon = this.add.sprite(
            this.SCREEN_WIDTH,
            0,
            "moon"
        )
        .setOrigin(0.5, 0.5)
        .setScale(0.25)
        .setDepth(10);

        this.house = this.add.sprite(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.95,
            "house"
        )
        .setOrigin(0.5, 1)
        .setScale(0.3)
        .setDepth(11);

        this.barn = this.add.sprite(
            this.SCREEN_WIDTH * 0.9,
            this.SCREEN_HEIGHT * 0.9,
            "barn"
        )
        .setOrigin(0.5, 1)
        .setScale(0.3)
        .setDepth(11);

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



    createStars() {

        this.stars = this.add.group();
        this.otherStars = this.add.group();

        const STAR_COUNT = 32;

        for (let i = 1; i <= STAR_COUNT; i++) {
            let star = this.add.sprite(
                this.SCREEN_WIDTH * Math.random(),
                this.SCREEN_HEIGHT * 0.5 * Math.random(),
                "star"
            )
            .setScale(0.001)
            .setAngle(Math.random() * 90);

            if (i % 2 == 0) {
                this.stars.add(star);
            } else {
                this.otherStars.add(star);
            }
        }

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

        this.judgement = this.add.text(
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
                frameRate: this.BPM / 10,
                repeat: -1
            });
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

        this.stopPracticeMusic();

        this.practicePhase++;

        let phase = this.practicePhases[this.practicePhase];

        this.dialogueIndex = 0;
        this.currentDialogue = phase.dialogue;

        this.tutorialPhase = 0;

    }



    spawnEntity(note, config) {

        let sprites = {

            cow: "walking",
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

            this.judgement.setText("PERFECT!");
            this.judgement.setStyle({ color: "#FFD700" });
            evaluation = "perfect!";
            this.perfectOkSFX.play({
                loop: false,
                // volume: BaseScene.masterVolume,
                volume: 1
            });

        } 
        
        else if (error <= this.OK_ERROR) {

            this.judgement.setText("Ok");
            this.judgement.setStyle({ color: "#228B22" });
            evaluation = "ok";
            this.perfectOkSFX.play({
                loop: false,
                // volume: BaseScene.masterVolume,
                volume: 1
            });

        } 

        else {

            this.judgement.setText("miss");
            this.judgement.setStyle({ color: "#D2D2D2" });
            evaluation = "miss";
            this.missSFX.play({
                loop: false,
                // volume: BaseScene.masterVolume,
                volume: 1
            });

        }

        this.flashJudgement();

        return evaluation;

    }



    applyScore(rating) {

        if (rating == "perfect!") {

            this.practiceHits++;
            let currentPhase = this.practicePhases[this.practicePhase];

            if (this.practiceHits >= currentPhase.hitsNeeded) {

                this.advancePracticePhase();

            }

            return;
            
        }

        if (rating == "ok") {

            this.okCount++;
            this.okScore.setText(`Miss: ${this.missCount}`);

        }

        if (rating == "miss") {

            this.missCount++;
            this.missScore.setText(`Miss: ${this.missCount}`);

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
        });

        this.otherStars.getChildren().forEach(star => {
            star.setAlpha(evenBeat ? 0.3 : 1);
            star.setScale(evenBeat ? 0.01 : 0.02);
        });

    }


}