class Level1 extends BaseScene {



    constructor() {

        super("level1");

        this.BPM = 120;
        this.BEAT_DURATION = 60 / this.BPM;
        this.TIME_SIGNATURE = 4;

        this.ERROR_MARGIN = 0.75;
        this.OK_ERROR = 0.25;
        this.PERFECT_ERROR = 0.1;

        this.spawnChance = 0.2;

    }


    preload() {

        this.load.audio("beefInstaller", "assets/audio/songs/beef_installer.wav");
        this.load.image("roomBackground", "assets/images/level1/roomBackground.png");
        this.load.video("windowVideo", "assets/images/level1/windowVideo.mp4");
        this.load.video("tutorial", "assets/images/level1/tutorial.mp4");

        this.load.audio("cat_tick", "assets/audio/SFX/level1/tick.wav");

        this.load.image("catDefault", "assets/images/level1/catDefault.png");
        this.load.image("catMiss", "assets/images/level1/catMiss.png");
        this.load.audio("hitDrum", "assets/audio/SFX/level1/winDrumPop.wav");

        this.load.image("ball", "assets/images/level1/ball.png");
        this.load.image("ballWin", "assets/images/level1/ballWin.png");
        this.load.audio("ballBeat", "assets/audio/SFX/level1/ballBeat.wav");
        this.load.audio("ballWinSound", "assets/audio/SFX/level1/ballWinSound.wav");

        this.load.image("catTreat", "assets/images/level1/catTreat.png");
        this.load.image("treatWin", "assets/images/level1/treatWin.png");
        this.load.image("treatHand1", "assets/images/level1/treatHand1.png");
        this.load.image("treatHand2", "assets/images/level1/treatHand2.png");
        this.load.audio("treatBeat", "assets/audio/SFX/level1/treatBeat.wav");
        this.load.audio("treatWinSound", "assets/audio/SFX/level1/treatWinSound.wav");

        this.load.image("sprayBottle", "assets/images/level1/sprayBottle.png");
        this.load.image("sprayBottleWin", "assets/images/level1/sprayBottleWin.png");
        this.load.audio("sprayBeat", "assets/audio/SFX/level1/sprayBeat.wav");
        this.load.audio("sprayWinSound", "assets/audio/SFX/level1/sprayWinSound.wav");

        this.load.spritesheet("sprayBottleSheet", "assets/images/level1/spray_sprite_sheet.png", {
            frameWidth: 1080,
            frameHeight: 720
        });

        this.load.image('fullscreen', "assets/images/menu/fullscreen.png");
        this.load.image('pause', 'assets/images/menu/pause_white.png');

    }

    onEnter() {

        this.sound.removeAll();
        this.sound.volume = BaseScene.masterVolume;
        this.spawnDelayBeats = 10;
        this.lastBeat = 0;
        this.lastBeatEvent = null;
        this.currentBeatContinuous = 0;
        this.musicPosition = 0;

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;
        this.totalScore = 0;

        this.activeEntities = [];
        this.initialized = false;
        

        this.noteCooldowns = {
            ball: 0,
            treat: 0,
            spray: 0
        };

        this.noteTypes = {

            ball: {

                texture: "ball",
                winTexture: "ballWin",
                anticipationBeats: 4,
                weight: 3

            },

            treat: {

                texture: "catTreat",
                winTexture: "treatWin",
                anticipationBeats: 3,
                weight: 2

            },

            spray: {

                texture: "sprayBottle",
                winTexture: "sprayBottleWin",
                anticipationBeats: 2,
                weight: 1

            }
            

        };

        this.createScene();

        this.anims.create({
            key: "sprayAnimation",
            frames: this.anims.generateFrameNumbers("sprayBottleSheet", {
                start: 0,
                end: 11
            }),
            frameRate: 24,
            repeat: 0
        });

        this.tutorialVideo = this.add.video(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.36,
            "tutorial"
        );
        this.tutorialVideo.setScale(0.23);
        this.tutorialVideo.setDepth(1);
        this.tutorialVideo.setVolume( BaseScene.masterVolume );

        this.startText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.9,
            "Click to start tutorial",
            {
                fontSize: "32px",
                color: "#ffffff"
            }
        ).setOrigin(0.5).setDepth(101);

        this.input.once("pointerdown", () => {

            this.startText.destroy();

            this.tutorialVideo.play();

            this.tutorialVideo.on("complete", () => {

                this.tutorialVideo.destroy();

                this.windowVideo = this.add.video(
                    this.SCREEN_WIDTH * 0.5,
                    this.SCREEN_HEIGHT * 0.4,
                    "windowVideo"
                );


                this.windowVideo.setScale(0.35);
                this.windowVideo.setDepth(0);
                this.windowVideo.setLoop(true);
                this.windowVideo.play( { volume: BaseScene.masterVolume });

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
                    }
                );

                this.startGameplay();

            });
        });

        this.roomBackground = this.add.image(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "roomBackground"
        );

        this.roomBackground.setDepth(1);
        this.roomBackground.setDisplaySize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

        this.tickSound = this.sound.add("cat_tick");

    }

    update() {
        if (!this.song || !this.song.isPlaying) {
            return;
        }
        
        this.updateTimestamps();
        this.updateEntities();
        this.playBeatEvents();
        this.playCatBounce();

        if (this.musicPosition >= this.levelDuration) {

        console.log("Level Complete");

    }
        

    }

    createScene() {

        this.cameras.main.setBackgroundColor("#272727");

        this.cat = this.add.image(

            this.SCREEN_WIDTH * 0.8,
            this.SCREEN_HEIGHT * 0.64,
            "catDefault"

        ).setDepth(15);

        this.timingText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.15,
            "Timing:",
            {
                fontSize: "32px",
                color: "#ffffff"
            }
        ).setOrigin(0.5);

        this.perfectScore = this.add.text(
            this.SCREEN_WIDTH * 0.85,
            this.SCREEN_HEIGHT * 0.04,
            `Perfect: ${this.perfectCount}`,
            { fontSize: "16px", color: "#FFD700" }
        );

        this.okScore = this.add.text(
            this.SCREEN_WIDTH * 0.85,
            this.SCREEN_HEIGHT * 0.07,
            `Ok: ${this.okCount}`,
            { fontSize: "16px", color: "#228B22" }
        );

        this.missScore = this.add.text(
            this.SCREEN_WIDTH * 0.85,
            this.SCREEN_HEIGHT * 0.1,
            `Miss: ${this.missCount}`,
            { fontSize: "16px", color: "#D3D3D3" }
        );

        this.backButton = this.add.text(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.1,
            "<- Back",
            { fontSize: "32px", color: "#FFFFFF" }
        )
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {

            this.sound.stopAll();
            this.changeScene("levelselectprototype");

        });
    }

    updateTimestamps() {

        this.musicPosition = (this.time.now - this.startTime) / 1000;
        this.currentBeatContinuous = this.musicPosition / this.BEAT_DURATION;
        this.lastBeat = Math.floor(this.currentBeatContinuous) % this.TIME_SIGNATURE;

    }

    playBeatEvents() {

        let currentBeatFloor = Math.floor(this.currentBeatContinuous);

        if (currentBeatFloor === this.lastBeatEvent) {
            return;
        }

        this.lastBeatEvent = currentBeatFloor;
        this.tickSound.play({ volume: BaseScene.sfxVolume * 0.3});

        for (let entity of this.activeEntities) {
            if (entity.noteType === "ball") {
                this.sound.play("ballBeat", { volume: BaseScene.sfxVolume * 0.3, seek: 0.0199 });
            }
        }

        for (let noteName in this.noteCooldowns) {
            if (this.noteCooldowns[noteName] > 0) {
                this.noteCooldowns[noteName]--;
            }
        }

        if (this.currentBeatContinuous >= this.spawnDelayBeats) {

            if (Math.random() < this.spawnChance) {
                this.spawnRandomNote();
            }

        }
    }

    spawnRandomNote() {

        let noteName = this.pickWeightedNote();
        let noteData = this.noteTypes[noteName];

        if (this.noteCooldowns[noteName] > 0) {

            return;

        }

        let targetBeat = this.currentBeatContinuous + noteData.anticipationBeats;

        let landingTaken = this.activeEntities.some(entity => {

            return Math.abs(entity.targetBeat - targetBeat) < 0.1;

        });

        if (landingTaken) {

            return;

        }

        let entity = this.spawnEntity(noteName, noteData, targetBeat);

        this.activeEntities.push(entity);
        this.noteCooldowns[noteName] = noteData.anticipationBeats + 1;
    }

    spawnEntity(noteName, noteData, targetBeat) {

        if (noteName === "spray") {
            return this.spawnSpray(noteData, targetBeat);
        }

        if (noteName === "ball") {
            return this.spawnBall(noteData, targetBeat);
        }

        if (noteName === "treat") {
            return this.spawnTreat(noteData, targetBeat);
        }

        entity.noteType = noteName;
        entity.winTexture = noteData.winTexture;
        entity.targetBeat = targetBeat;

        this.tweens.add({
            targets: entity,
            x: this.cat.x,
            y: this.cat.y,
            duration: noteData.anticipationBeats * this.BEAT_DURATION * 1000,
            ease: "Linear",
            onComplete: () => {
                if (entity.active) {
                    entity.destroy();
                }
            }
        });

        return entity;
    }


    spawnSpray(noteData, targetBeat) {
        let entity = this.add.sprite(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.5,
            "sprayBottleSheet",
            0
        );

        entity.setScale(1);
        entity.setDepth(11);

        entity.noteType = "spray";
        entity.winTexture = noteData.winTexture;
        entity.targetBeat = targetBeat;

        let beatMs = this.BEAT_DURATION * 1000;

        this.tweens.add({
            targets: entity,
            x: this.SCREEN_WIDTH * 0.45,
            duration: beatMs * 0.5,
            ease: "Linear",
            onComplete: () => {
                this.sound.play("sprayBeat", {
                    volume: BaseScene.sfxVolume * 0.3
                });
                entity.play("sprayAnimation");
            }
        });

        return entity;
    }

    spawnBall(noteData, targetBeat) {
        let startX = -this.SCREEN_WIDTH * 0.09; // starts slightly offscreen left
        let endX = this.cat.x - this.SCREEN_WIDTH * 0.1; // goes a little past cat

        let peakY = this.SCREEN_HEIGHT * 0.55;
        let groundY = this.SCREEN_HEIGHT * 0.8;

        let entity = this.add.image(
            startX,
            peakY,
            "ball"
        ).setScale(0.62).setDepth(20);

        entity.noteType = "ball";
        entity.winTexture = noteData.winTexture;
        entity.targetBeat = targetBeat;

        let totalDuration = (targetBeat - this.currentBeatContinuous) * this.BEAT_DURATION * 1000;
        let motion = { progress: 0 };

        this.tweens.add({
            targets: motion,
            progress: 1,
            duration: totalDuration,
            ease: "Linear",
            onUpdate: () => {
                let p = motion.progress;

                entity.x = startX + (endX - startX) * p;

                let arcProgress = p * 4; // 4 bounces / arches
                let currentArc = Math.floor(arcProgress);
                let localProgress = arcProgress - currentArc;

                if (p >= 1) {
                    localProgress = 1;
                }

                let curve = 4 * localProgress * (1 - localProgress);

                entity.y = groundY + (peakY - groundY) * curve;

                let baseSpin = 1;
                let peakSpin = 5;
                entity.angle += baseSpin + curve * peakSpin;

            }
        });

        return entity;
    }

    spawnTreat(noteData, targetBeat) {
        let handStartX = this.SCREEN_WIDTH * -0.1;
        let handStartY = this.SCREEN_HEIGHT * 0.68;

        let handTossX = this.SCREEN_WIDTH * -0.01;
        let handTossY = this.SCREEN_HEIGHT * 0.57;

        let mouthX = this.cat.x - this.SCREEN_WIDTH * 0.04;
        let mouthY = this.cat.y - this.SCREEN_HEIGHT * 0.15;

        let hand = this.add.image(
            handStartX,
            handStartY,
            "treatHand1"
        ).setScale(1).setDepth(20);

        hand.setAngle(+120);
        hand.setOrigin(0.3, 0.8);

        hand.noteType = "treat";
        hand.winTexture = noteData.winTexture;
        hand.targetBeat = targetBeat;

        let totalDuration = (targetBeat - this.currentBeatContinuous) * this.BEAT_DURATION * 1000;
        let handDuration = this.BEAT_DURATION * 1000;      // 1 beat
        let treatDuration = this.BEAT_DURATION * 1000 * 2.2; // 2 beats

        this.tweens.add({
            targets: hand,
            x: handTossX,
            y: handTossY,
            angle: +30,
            duration: handDuration,
            ease: "Sine.In",
            onComplete: () => {
                hand.setTexture("treatHand2");

                let treatStartX = hand.x + this.SCREEN_WIDTH * 0.105;
                let treatStartY = hand.y - this.SCREEN_HEIGHT * 0.04;

                let treatEndX = mouthX - this.SCREEN_WIDTH * 0.045;
                let treatEndY = mouthY - this.SCREEN_HEIGHT * 0.004;

                let treat = this.add.image(
                    treatStartX,
                    treatStartY,
                    "catTreat"
                ).setScale(1).setDepth(21);

                let originalAudioBeats = 3;
                let audioRate = (originalAudioBeats * this.BEAT_DURATION * 1000) / treatDuration;

                this.sound.play("treatBeat", {
                    volume: BaseScene.sfxVolume * 0.3,
                    rate: audioRate * 1.4
                });

                this.tweens.add({
                    targets: treat,
                    angle: treat.angle + 360,
                    duration: treatDuration,
                    ease: "Linear"
                });

                treat.noteType = "treat";
                treat.winTexture = noteData.winTexture;
                treat.targetBeat = targetBeat;

                this.activeEntities = this.activeEntities.filter(e => e !== hand);
                this.activeEntities.push(treat);

                let motion = { progress: 0 };

                this.tweens.add({
                    targets: motion,
                    progress: 1,
                    duration: treatDuration,
                    ease: "Linear",
                    onUpdate: () => {
                        let p = motion.progress;

                        treat.x = treatStartX + (treatEndX - treatStartX) * p;

                        let arcHeight = this.SCREEN_HEIGHT * 0.18;
                        let arc = 4 * p * (1 - p);

                        treat.y = treatStartY + (treatEndY - treatStartY) * p - arcHeight * arc;
                    },
                    onComplete: () => {
                        if (treat.active) {
                            treat.destroy();
                        }

                        if (hand.active) {
                            hand.destroy();
                        }
                    }
                });
            }
        });

        return hand;
    }


    handleInput() {

        let entity = this.getClosestEntity();

        if (!entity) {

            return;

        }

        let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

        if (error > this.ERROR_MARGIN) {

            this.timingText.setText("Miss");
            this.showCatMiss();
            this.applyScore("miss");
            return;

        }

        let rating = this.getJudgement(error);

        this.cat.setTexture(entity.winTexture);

        this.sound.play("hitDrum", {
            volume: BaseScene.sfxVolume * 0.3
        });

        if (entity.noteType === "ball") {
            this.sound.play("ballWinSound", {
                volume: BaseScene.sfxVolume * 0.3,
                seek: 0.05
            });
        }

        if (entity.noteType === "treat") {
            this.sound.play("treatWinSound", {
                volume: BaseScene.sfxVolume * 0.3,
                seek: 0.01
            });
        }

        if (entity.noteType === "spray") {
            this.sound.play("sprayWinSound", {
                volume: BaseScene.sfxVolume * 0.3,
            });
        }

        this.time.delayedCall(250, () => {

            this.cat.setTexture("catDefault");

        });

        entity.destroy();
        this.activeEntities = this.activeEntities.filter(e => e !== entity);

        this.applyScore(rating);
    }

    playCatBounce() {
            let earlyOffset = 0.035;
            let earlyBeatFloor = Math.floor(this.currentBeatContinuous + earlyOffset);

            if (earlyBeatFloor === this.lastCatBounceBeat) {
                return;
            }

            this.lastCatBounceBeat = earlyBeatFloor;

            this.tweens.killTweensOf(this.cat);

            this.cat.setScale(1, 1);

            this.tweens.add({
                targets: this.cat,
                scaleX: 1.03,
                scaleY: 0.96,
                y: this.cat.y + 6,
                duration: 55,
                yoyo: true,
                ease: "Quad.Out"
            });
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

    getJudgement(error) {

        if (error <= this.PERFECT_ERROR) {

            this.timingText.setText("PERFECT!");
            return "perfect!";

        }

        if (error <= this.OK_ERROR) {

            this.timingText.setText("Ok");
            return "ok";
            
        }

        this.timingText.setText("Miss");
        return "miss";

    }
    startGameplay() {

        this.song = this.sound.add("beefInstaller");

        this.song.play({
            volume: BaseScene.musicVolume * 0.8
        });

        this.startTime = this.time.now + 100;

        this.input.removeAllListeners("pointerdown");
        this.input.on("pointerdown", () => {
            this.handleInput();
        });
    }

    updateEntities() {

        for (let i = this.activeEntities.length - 1; i >= 0; i--) {

            let entity = this.activeEntities[i];

            if (this.currentBeatContinuous > entity.targetBeat + this.ERROR_MARGIN) {

                entity.destroy();
                this.activeEntities.splice(i, 1);
                this.timingText.setText("Miss");
                this.showCatMiss();
                this.applyScore("miss");

            }

        }
    }



    applyScore(rating) {

        switch (rating) {

            case "perfect!":

                this.perfectCount++;
                this.perfectScore.setText(`Perfect: ${this.perfectCount}`);
                break;

            case "ok":

                this.okCount++;
                this.okScore.setText(`Ok: ${this.okCount}`);
                break;

            case "miss":

                this.missCount++;
                this.missScore.setText(`Miss: ${this.missCount}`);
                break;

        }
    }


    showCatMiss() {
        this.cat.setTexture("catMiss");

        this.time.delayedCall(250, () => {
            this.cat.setTexture("catDefault");
        });
    }

    pickWeightedNote() {

        let weightedList = [];

        for (let noteName in this.noteTypes) {

            let noteData = this.noteTypes[noteName];

            for (let i = 0; i < noteData.weight; i++) {

                weightedList.push(noteName);
                
            }

        }

        return Phaser.Utils.Array.GetRandom(weightedList);
    }
}