class GameplayPrototype3 extends BaseScene {
    constructor() {

        super("gameplayprototype3");

        this.SONG = 0;

        this.scrollSpeed = 1; // speed multiplier

        this.spawnIndex = 0;
        this.activeEntities = [];
        
        this.ENTITY_TIMING_CONFIG =  {
            small: { anticipationBeats: 1.5 },
            medium: { anticipationBeats: 2 },
            large: { anticipationBeats: 3 },
            xlarge: { anticipationBeats: 4 },
            xxlarge: { anticipationBeats: 5 }
        };

        // Error margins
        this.ERROR_MARGIN = 0.6;
        this.OK_ERROR = 0.3;
        this.PERFECT_ERROR = 0.15;

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;

        this.initialized = false;

        this.sunHues = [
            { min: 0,   max: 0   },  // natural orange (no shift)
            { min: -20, max: -10 },  // shift toward red-orange
            { min: 10,  max: 20  },  // shift toward yellow
            { min: 20,  max: 40  },  // shift toward pure yellow
            { min: 320, max: 340 },  // shift toward red
            { min: 180, max: 220 },  // shift toward blue
        ];

    }

    preload() {

        this.load.audio('paranoia', '../assets/audio/paranoia.mp3');
        this.load.audio('jubeatb2b', '../assets/audio/jubeatb2b.mp3');
        this.load.audio('enemySpawnSoundEffect', '../assets/audio/enemySpawn.wav');
        this.load.audio('laser', '../assets/audio/laser.wav');
        this.load.json('score', '../assets/score_old.json');

        this.load.image('planet1', '../assets/images/gameplay/planet1.png');
        this.load.image('planet2', '../assets/images/gameplay/planet2.png');
        this.load.image('planet3', '../assets/images/gameplay/planet3.png');
        this.load.image('sun', '../assets/images/gameplay/sun.png');
        this.load.spritesheet('star', '../assets/images/gameplay/twinkling_star.png', { frameWidth: 9, frameHeight: 9 });
        this.load.image('angry_alien', '../assets/images/gameplay/angry_alien.png');
        this.load.image('friendly_alien', '../assets/images/gameplay/friendly_alien.png');
        this.load.image('crosshair', '../assets/images/gameplay/crosshair.png')
    }

    onEnter() {
        this.planets = this.add.group();
        this.stars = this.add.group();
        this.suns = this.add.group();

        this.judgement = Object.freeze({
            PERFECT: 0,
            OK: 1,
            MISS: 2,
            FRIENDLY_FIRE: 3
        });

        this.scaleFactor = 3;
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
        this.cursor = this.add.image(
            this.SCREEN_WIDTH * 0.5, 
            this.SCREEN_HEIGHT * 0.5, 
            'crosshair')
            .setOrigin(0.5, 0.5)
            .setDepth(1)
            .setScale(7);

        // back button
        this.backButton = this.add.text(
        this.SCREEN_WIDTH * 0.1,
        this.SCREEN_HEIGHT * 0.1,
        `<- Back`)
        .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
        .setOrigin(0, 0)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
            this.game.sound.stopAll();
            this.changeScene('cinematicsmenuprototype1');
        });

        this.spawnPoints = this.add.group();
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .3));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .3));
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .5));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .5));
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .7));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .7));
        this.currSpawn = 0;

        this.laserSpawnLeft = this.add.container(this.SCREEN_WIDTH * .25, this.SCREEN_HEIGHT);
        this.laserSpawnRight = this.add.container(this.SCREEN_WIDTH * .75, this.SCREEN_HEIGHT);


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
        this.playBeatEvents();
    }

    playBeatEvents() {

        if (this.lastBeat === this.lastBeatEvent) {

            return;

        }

        this.lastBeatEvent = this.lastBeat;

        let evenBeat = (this.lastBeat % 2 == 0);

        this.updateColors(evenBeat);
        this.updateBounces();
    }

    updateColors() {
        this.planets.getChildren().forEach(planet => {
            planet.fx.hue(Phaser.Math.Between(10, 350));
        });
        this.suns.getChildren().forEach(sun => {
            const chosen = Phaser.Utils.Array.GetRandom(this.sunHues);
            const hue = Phaser.Math.Between(chosen.min, chosen.max);
            sun.fx.hue(hue);
        })
    }

    updateBounces() {
        this.planets.getChildren().forEach(planet => {
            this.tweens.add({
                targets: planet,
                scale: planet.scale * 0.8,
                duration: 50,
                yoyo: true
            });
        });
        this.suns.getChildren().forEach(sun => {
            this.tweens.add({
                targets: sun,
                scale: sun.scale * 0.8,
                duration: 50,
                yoyo: true
            });
        });
        this.stars.getChildren().forEach(star => {
            this.tweens.add({
                targets: star,
                scale: star.scale * 0.8,
                duration: 50,
                yoyo: true
            });
        });
        for (let entity of this.activeEntities) {
            this.tweens.add({
                targets: entity,
                scale: entity.scale * 0.8,
                duration: 50,
                yoyo: true
            });
        };

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

    getJudgement(error, entity) {

        let evaluation = "";
        console.log(error);
        console.log(entity.enemy);
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
        let laser = this.add.graphics();
        laser.lineStyle(3, 0xd02b14, 1);
        laser.beginPath();

        this.sound.play('laser');
        this.cameras.main.shake(100, .003);

        switch (judgement) {
            case 0:
                if (entity.spawnedFromLeft) {
                    laser.moveTo(this.laserSpawnLeft.x, this.laserSpawnLeft.y);
                    laser.lineTo(entity.x, entity.y);
                } else {
                    laser.moveTo(this.laserSpawnRight.x, this.laserSpawnRight.y);
                    laser.lineTo(entity.x, entity.y);
                }
                entity.destroy();
                break;
            case 1:
                if (entity.spawnedFromLeft) {
                    laser.moveTo(this.laserSpawnLeft.x, this.laserSpawnLeft.y);
                    laser.lineTo(entity.x, entity.y);
                } else {
                    laser.moveTo(this.laserSpawnRight.x, this.laserSpawnRight.y);
                    laser.lineTo(entity.x, entity.y);
                }
                entity.destroy();
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
                    entity.destroy();
                } 
                else {
                    laser.moveTo(this.laserSpawnRight.x, this.laserSpawnRight.y);
                    laser.lineTo(entity.x, entity.y);
                    entity.destroy();
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
        planet.fx = planet.enableFilters().filters.internal.addColorMatrix().colorMatrix;
        planet.fx.hue(Phaser.Math.Between(10, 350));
        //further planets should be darker
        const brightness = planet.scaleFactor / (this.scaleFactor + 1);
        planet.fx.brightness(brightness, true);

        this.tweens.add({
            targets: planet,
            x: this.SCREEN_WIDTH + planet.width / 2,
            duration: 30000 / planet.scaleFactor,
            onComplete: () => {
                this.planets.remove(planet);
                planet.destroy();
            }
        })

        this.planets.add(planet);
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
                this.stars.remove(star);
                star.destroy();
            }
        })
        const alphaMap = [.1, 0.33, 0.66, 1, 0.66, 0.33]; // one value per frame

        star.on('animationupdate', (anim, frame) => {
            star.setAlpha(alphaMap[frame.textureFrame]);
        });

        this.stars.add(star);
    }

    spawnSun() {
        const sun = this.add.sprite(-100, Phaser.Math.Between(0, this.SCREEN_HEIGHT), 'sun');
        sun.scaleFactor = Phaser.Math.FloatBetween(.5, this.scaleFactor);
        sun.setScale(sun.scaleFactor);
        sun.setDepth(-2);

        sun.fx = sun.enableFilters().filters.internal.addColorMatrix().colorMatrix;
        const chosen = Phaser.Utils.Array.GetRandom(this.sunHues);
        const hue = Phaser.Math.Between(chosen.min, chosen.max);
        sun.fx.hue(hue);
        //further suns should be darker, but not too dark
        const brightness = Phaser.Math.Linear(0.4, 0.7, sun.scaleFactor / this.scaleFactor);
        sun.fx.brightness(brightness, true);

        this.tweens.add({
            targets: sun,
            x: this.SCREEN_WIDTH + sun.width / 2,
            duration: 30000 / sun.scaleFactor,
            onComplete: () => {
                this.suns.remove(sun);
                sun.destroy();
            }
        })

        this.suns.add(sun);
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

    updateTimestamps() {

        this.musicPosition = this.music.seek - this.SONG_DELAY;

        // Express this.musicPosition in terms of the current beat and BPM
        this.currentBeatContinuous = (this.musicPosition / this.BEAT_DURATION);
        this.lastBeat = Math.floor(this.currentBeatContinuous - this.PICKUP_BEATS) % this.TIME_SIGNATURE;

    }

    spawnEntity(note, config) {
        const spawn = this.spawnPoints.getChildren()[this.currSpawn];
        if (this.currSpawn % 2 === 0) {
            spawn.spawnedFromLeft = true;
        }

        const rand = Phaser.Math.Between(0, 4);
        const entityList = ["angry_alien", "friendly_alien"];
        let index = 0
        if (rand == 4 ) {
            index = 1;
        }
        let entity = this.add.image(
            spawn.x,
            spawn.y,
            entityList[index]
        ).setScale(this.scaleFactor).setOrigin(.5, .5);
        entity.enemy = index;
        // left spawn
        this.sound.play('enemySpawnSoundEffect');
        if (this.currSpawn % 2 == 0) {
            this.tweens.add({
                targets: entity,
                duration: 50,
                x: 10 + entity.width / 2,
                ease: 'Sine.Out',
                onComplete: () => {
                    this.tweens.add({
                        targets: entity,
                        duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000 * 2 - 50, // x2 because they're gonna cross the entire screen
                        x: this.SCREEN_WIDTH - 10 - entity.width / 2,
                        onComplete: () => {
                            this.tweens.add({
                                targets: entity,
                                x: this.SCREEN_WIDTH + 20,
                                duration: 50,
                                ease: 'Sine.In',
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
                        duration: config.anticipationBeats * this.BEAT_DURATION * this.scrollSpeed * 1000 * 2, // x2 because they're gonna cross the entire screen
                        x: 10 + entity.width / 2,
                        onComplete: () => {
                            this.tweens.add({
                                targets: entity,
                                x:  -20,
                                duration: 50,
                                ease: 'Sine.In',
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
        entity.targetBeat = note.beat;
        entity.judged = false;
        this.currSpawn++;
        if (this.currSpawn >= this.spawnPoints.getChildren().length) {
            this.currSpawn = 0;
        }

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