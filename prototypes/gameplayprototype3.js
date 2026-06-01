class GameplayPrototype3 extends BaseScene {
    constructor() {

        super("gameplayprototype3");

        this.SONG = 0;

        this.scrollSpeed = 1; // speed multiplier

        this.spawnIndex = 0;
        this.activeEntities = [];
        
        this.ENTITY_TIMING_CONFIG =  {

            cat: { anticipationBeats: 2 },
            rat: { anticipationBeats: 1.5 },
            dog: { anticipationBeats: 3 }

        };

        // Error margins
        this.ERROR_MARGIN = 0.6;
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

        this.load.image('planet1', '../assets/images/gameplay/planet1.png');
        this.load.image('planet2', '../assets/images/gameplay/planet2.png');
        this.load.image('planet3', '../assets/images/gameplay/planet3.png');
        this.load.image('sun', '../assets/images/gameplay/sun.png');
        this.load.spritesheet('star', '../assets/images/gameplay/twinkling_star.png', { frameWidth: 9, frameHeight: 9 });
        this.load.image('angry_alien', '../assets/images/gameplay/angry_alien.png');
        this.load.image('friendly_alien', '../assets/images/gameplay/friendly_alien.png');
    }

    onEnter() {
        this.scaleFactor = 2;
        this.planet_array = ['planet1', 'planet2', 'planet3'];
        this.score = this.cache.json.get('score');
        this.notes = this.score.notes;
        this.songInfo = this.score.song;
        console.log(this.score);

        this.BPM = this.songInfo[this.SONG].bpm;                    // BPM
        this.BEAT_DURATION = 60 / this.BPM;                 // how many seconds is 1 beat
        this.lastBeat = 0;                                  // current beat of the measure
        this.TIME_SIGNATURE = 4;                            // time signature
        this.currentBeatContinuous = 2;                     // elapsed beats with decimals
        this.SONG_DELAY = this.songInfo[this.SONG].startdelay;      // the error between when the mp3 plays and the actual song starts
        this.PICKUP_BEATS = this.songInfo[this.SONG].pickupbeats;   // how many pick up beats there are

        // Add Music
        this.music = this.sound.add(`${this.songInfo[this.SONG].name}`);

        // Create text
        if (1) {
        let disclaimer = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.05,
            "Gameplay prototype v4")
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

        this.nextPlanetDelay = 100;
        this.nextStarDelay = 200;
        this.nextSunDelay = 1000
        this.cameras.main.setBackgroundColor('#010B19');

        this.anims.create({
            key: 'star',
            frames: this.anims.generateFrameNumbers('star', {start: 0, end: 5}),
            frameRate: 3,
            repeat: -1
        })
    }

    update(time, delta) {
        this.nextPlanetDelay -= delta;
        this.nextStarDelay -= delta;
        this.nextSunDelay -= delta;
        if (this.nextPlanetDelay <= 0) {
            this.spawnPlanet();
            this.nextPlanetDelay = Phaser.Math.Between(1000, 7000);
        }
        if (this.nextStarDelay <= 0) {
            this.spawnStar();
            this.nextStarDelay = Phaser.Math.Between(2000, 4500);
        }
        if(this.nextSunDelay <= 0) {
            this.spawnSun();
            this.nextSunDelay = Phaser.Math.Between(10000, 15000);
        }

        this.updateTimestamps();
        this.updateEntities();
        this.spawnEntities();
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

        let rating = this.getJudgement(error, entity);

        this.lastInput.setText(`most recent input on beat ${this.currentBeatContinuous.toFixed(2)}`);

        this.applyScore(rating);

        entity.destroy();
        this.activeEntities = this.activeEntities.filter(e => e !== entity);

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
                duration: 500,
                yoyo: false,
                repeat: 0

            });

    }

    getJudgement(error, entity) {

        let evaluation = "";

        if ((error <= this.PERFECT_ERROR && entity.enemy == 0) || (error == null && entity.enemy == 1)) {

            this.judgement.setText("PERFECT!");
            this.judgement.setStyle({ color: "#FFD700"});
            evaluation = "perfect!";

        } 

        else if (error <= this.OK_ERROR && entity.enemy == 0) {

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

    spawnPlanet() {
        const planet = this.add.sprite(-100, Phaser.Math.Between(0, this.SCREEN_HEIGHT), Phaser.Utils.Array.GetRandom(this.planet_array));
        planet.scaleFactor = Phaser.Math.FloatBetween(1, this.scaleFactor);
        planet.setScale(planet.scaleFactor);
        planet.setDepth(-2);
        const fx = planet.enableFilters().filters.internal.addColorMatrix().colorMatrix;
        fx.hue(Phaser.Math.Between(10, 350));
        //further planets should be darker
        const brightness = planet.scaleFactor / (this.scaleFactor + 1);
        fx.brightness(brightness, true);

        this.tweens.add({
            targets: planet,
            x: this.SCREEN_WIDTH + planet.width / 2,
            duration: 30000 / planet.scaleFactor,
            onComplete: () => {
                planet.destroy();
            }
        })
    }
    spawnStar() {
        const star = this.add.sprite(-50, Phaser.Math.Between(0, this.SCREEN_HEIGHT), 'star');
        star.scaleFactor = Phaser.Math.FloatBetween(.5, 1.5);
        star.setScale(star.scaleFactor);
        star.setDepth(-3);
        star.play('star');
        star.setAlpha(1);
        this.tweens.add({
            targets: star,
            x: this.SCREEN_WIDTH + star.width / 2,
            duration: 50000 / star.scaleFactor,
            onComplete: () => {
                star.destroy();
            }
        })
        const alphaMap = [.1, 0.33, 0.66, 1, 0.66, 0.33]; // one value per frame

        star.on('animationupdate', (anim, frame) => {
            star.setAlpha(alphaMap[frame.textureFrame]);
        });
    }

    spawnSun() {
        const sun = this.add.sprite(-100, Phaser.Math.Between(0, this.SCREEN_HEIGHT), 'sun');
        sun.scaleFactor = Phaser.Math.FloatBetween(.5, this.scaleFactor);
        sun.setScale(sun.scaleFactor);
        sun.setDepth(-2);

        const sunHues = [
            { min: 0,   max: 0   },  // natural orange (no shift)
            { min: -20, max: -10 },  // shift toward red-orange
            { min: 10,  max: 20  },  // shift toward yellow
            { min: 20,  max: 40  },  // shift toward pure yellow
            { min: 320, max: 340 },  // shift toward red
            { min: 180, max: 220 },  // shift toward blue
        ];

        const fx = sun.enableFilters().filters.internal.addColorMatrix().colorMatrix;
        const chosen = Phaser.Utils.Array.GetRandom(sunHues);
        const hue = Phaser.Math.Between(chosen.min, chosen.max);
        fx.hue(hue);
        //further suns should be darker, but not too dark
        const brightness = Phaser.Math.Linear(0.4, 0.7, sun.scaleFactor / this.scaleFactor);
        fx.brightness(brightness, true);

        this.tweens.add({
            targets: sun,
            x: this.SCREEN_WIDTH + sun.width / 2,
            duration: 30000 / sun.scaleFactor,
            onComplete: () => {
                sun.destroy();
            }
        })
    }

    updateEntities() {

        for (let i = this.activeEntities.length - 1; i >= 0; i--) {

            let entity = this.activeEntities[i];

            if (this.currentBeatContinuous > entity.targetBeat + this.ERROR_MARGIN) {

                entity.destroy();

                this.activeEntities.splice(i, 1);

                this.getJudgement(null, entity);

                if (entity.enemy = 0) {
                    this.applyScore("miss");
                }
                if (entity.enemy = 1) {
                    this.applyScore("perfect!")
                }

            }
        }
    }

    updateTimestamps() {

        this.musicPosition = this.music.seek - this.SONG_DELAY;

        // Express this.musicPosition in terms of the current beat and BPM
        this.currentBeatContinuous = (this.musicPosition / this.BEAT_DURATION);
        this.lastBeat = Math.floor(this.currentBeatContinuous - this.PICKUP_BEATS) % this.TIME_SIGNATURE;

    }

    spawnEntity(note, config) {

        let colors = {
            dog: 0xFF0000,
            rat: 0x00FF00,
            cat: 0x0000FF
        };

        let entityColor = colors[note.type] ?? 0xFFFFFF;
        const rand = Phaser.Math.Between(0, 4);
        const entityList = ["angry_alien", "friendly_alien"];
        let index = 0
        if (rand == 4 ) {
            index = 1;
        }
        let entity = this.add.image(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.3,
            entityList[index]
        ).setScale(this.scaleFactor);
        entity.enemy = index;

        this.tweens.add({
            targets: entity,
            duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000,
            x: this.cursor.x
        })

        entity.noteType = note.type;
        entity.targetBeat = note.beat;
        entity.judged = false;

        return entity;

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
}