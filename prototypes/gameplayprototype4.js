class GameplayPrototype4 extends BaseScene {



    constructor() {

        super("gameplayprototype4");

        this.BPM = 120;
        this.BEAT_DURATION = 60 / this.BPM;
        this.TIME_SIGNATURE = 4;

        this.ERROR_MARGIN = 0.3;
        this.OK_ERROR = 0.2;
        this.PERFECT_ERROR = 0.1;

        this.spawnChance = 0.2;

    }



    preload() {

        this.load.audio("cat_tick", "../assets/audio/tick.wav");

        this.load.image("catDefault", "../assets/images/gameplay/catDefault.png");

        this.load.image("ball", "../assets/images/gameplay/ball.png");
        this.load.image("ballWin", "../assets/images/gameplay/ballWin.png");

        this.load.image("catTreat", "../assets/images/gameplay/catTreat.png");
        this.load.image("treatWin", "../assets/images/gameplay/treatWin.png");

        this.load.image("sprayBottle", "../assets/images/gameplay/sprayBottle.png");
        this.load.image("sprayBottleWin", "../assets/images/gameplay/sprayBottleWin.png");

    }



    onEnter() {

        this.sound.removeAll();

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
                weight: 1

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
                weight: 3

            }

        };

        this.createScene();

        this.startTime = this.time.now;
        this.tickSound = this.sound.add("cat_tick");

        this.input.removeAllListeners("pointerdown");
        this.input.on("pointerdown", () => {

            this.handleInput();

        });

    }



    update() {

        this.updateTimestamps();
        this.updateEntities();
        this.playBeatEvents();

    }



    createScene() {

        this.cameras.main.setBackgroundColor("#272727");

        this.cat = this.add.image(

            this.SCREEN_WIDTH * 0.8,
            this.SCREEN_HEIGHT * 0.7,
            "catDefault"

        );

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
        this.tickSound.play({ volume: 0.0 });

        for (let noteName in this.noteCooldowns) {

            if (this.noteCooldowns[noteName] > 0) {

                this.noteCooldowns[noteName]--;

            }

        }

        if (Math.random() < this.spawnChance) {

            this.spawnRandomNote();

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

        let entity = this.add.image(
            this.SCREEN_WIDTH * 0.1,
            this.SCREEN_HEIGHT * 0.7,
            noteData.texture
        ).setScale(0.2);

        if (noteName === "ball") {

            this.tweens.add({
                targets: entity,
                y: entity.y - 80,
                duration: (noteData.anticipationBeats * this.BEAT_DURATION * 1000) / 8,
                yoyo: true,
                repeat: 3,
                ease: "Sine.Out"
            });

        }

        if (noteName === "treat") {

            entity.setY(this.SCREEN_HEIGHT * 0.4);

        }

        if (noteName === "spray") {

            entity.setX(this.SCREEN_WIDTH * 0.4);
            entity.setY(this.SCREEN_HEIGHT * 0.7);

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



    handleInput() {

        let entity = this.getClosestEntity();

        if (!entity) {

            return;

        }

        let error = Math.abs(this.currentBeatContinuous - entity.targetBeat);

        if (error > this.ERROR_MARGIN) {

            this.timingText.setText("Miss");
            this.applyScore("miss");
            return;

        }

        let rating = this.getJudgement(error);

        this.cat.setTexture(entity.winTexture);

        this.time.delayedCall(250, () => {

            this.cat.setTexture("catDefault");

        });

        entity.destroy();
        this.activeEntities = this.activeEntities.filter(e => e !== entity);

        this.applyScore(rating);
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



    updateEntities() {

        for (let i = this.activeEntities.length - 1; i >= 0; i--) {

            let entity = this.activeEntities[i];

            if (this.currentBeatContinuous > entity.targetBeat + this.ERROR_MARGIN) {

                entity.destroy();
                this.activeEntities.splice(i, 1);
                this.timingText.setText("Miss");
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