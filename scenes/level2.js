// new version of my (Beck's) level, with the new music

class Level2 extends BaseScene {
    constructor() {

        super("level2");

        this.SONG = 0;

        this.scrollSpeed = 1; // speed multiplier

        this.activeEntities = [];
        
        this.ENTITY_TIMING_CONFIG =  {
            small: { anticipationBeats: 4 }
        };

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

        // Error margins
        this.ERROR_MARGIN = 0.6;
        this.OK_ERROR = 0.3;
        this.PERFECT_ERROR = 0.15;

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
        this.load.audio('suspicious', '../assets/audio/songs/suspicious.mp3');
        this.load.audio('enemySpawnSoundEffect', '../assets/audio/SFX/level2/enemySpawn.wav');
        this.load.audio('friendSpawnSoundEffect', '../assets/audio/SFX/level2/friendSpawn.wav');
        this.load.audio('laser', '../assets/audio/SFX/level2/laser.wav');
        this.load.json('score_suspicious', '../assets/audio/beatmaps/score_suspicious.json');

        this.load.image('planet1', '../assets/images/level2/planet1.png');
        this.load.image('pause', '../assets/images/menu/pause.png');
        this.load.image('planet2', '../assets/images/level2/planet2.png');
        this.load.image('planet3', '../assets/images/level2/planet3.png');
        this.load.image('sun', '../assets/images/level2/sun.png');
        this.load.spritesheet('star', '../assets/images/level2/twinkling_star.png', { frameWidth: 9, frameHeight: 9 });
        this.load.spritesheet('explosion', "../assets/images/level2/explosion_particle.png", { frameWidth: 32, frameHeight: 32});
        this.load.image('angry_alien', '../assets/images/level2/angry_alien.png');
        this.load.image('friendly_alien', '../assets/images/level2/friendly_alien.png');
        this.load.image('crosshair', '../assets/images/level2/crosshair.png');
        this.load.image('fullscreen', "../assets/images/menu/fullscreen.png");
    }

    onEnter() {

        this.perfectCount = 0;
        this.okCount = 0;
        this.missCount = 0;
        this.spawnIndex = 0;

        this.initialized = false;

        this.sound.removeAll();
        this.sound.volume = BaseScene.masterVolume;
        
        this.planets = this.add.group();
        this.stars = this.add.group();
        this.suns = this.add.group();

        this.judgement = Object.freeze({
            PERFECT: 0,
            OK: 1,
            MISS: 2,
            FRIENDLY_FIRE: 3
        });

        this.scaleFactor = 4;
        this.planet_array = ['planet1', 'planet2', 'planet3'];
        this.score = this.cache.json.get('score_suspicious');
        this.notes = this.score.notes;
        this.songInfo = this.score.song;
        console.log(this.score);

        this.totalNotes = this.notes.length;
        this.perfectPoints = this.MAXIMUM_SCORE / this.totalNotes;
        this.okPoints = (this.MAXIMUM_SCORE * 0.75) / this.totalNotes;
        this.totalScore = 0;

        this.BPM = this.songInfo[this.SONG].bpm;                    // BPM
        this.BEAT_DURATION = 60 / this.BPM;                 // how many seconds is 1 beat
        this.lastBeat = 0;                                  // current beat of the measure
        this.TIME_SIGNATURE = 4;                            // time signature
        this.currentBeatContinuous = 2;                     // elapsed beats with decimals
        this.SONG_DELAY = this.songInfo[this.SONG].startdelay;      // the error between when the mp3 plays and the actual song starts
        this.PICKUP_BEATS = this.songInfo[this.SONG].pickupbeats;   // how many pick up beats there are

        // Add Music
        if (BaseScene.currentMusic) BaseScene.currentMusic.stop();
        this.music = this.sound.add(`${this.songInfo[this.SONG].name}`, {
            volume: BaseScene.musicVolume,
        });
        BaseScene.currentMusic = this.music;

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
            }
        );
        this.pauseButton.fx = this.pauseButton.enableFilters().filters.internal.addColorMatrix().colorMatrix;
        this.pauseButton.fx.hue(100);

        // Create text
        if (1) {
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


        this.spawnPoints = this.add.group();
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .3));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .3));
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .5));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .5));
        this.spawnPoints.add(this.add.container(-20, this.SCREEN_HEIGHT * .7));
        this.spawnPoints.add(this.add.container(this.SCREEN_WIDTH + 20, this.SCREEN_HEIGHT * .7));
        this.laserSpawnLeft = this.add.container(this.SCREEN_WIDTH * .25, this.SCREEN_HEIGHT);
        this.laserSpawnRight = this.add.container(this.SCREEN_WIDTH * .75, this.SCREEN_HEIGHT);

        this.musicStarted = false;

        this.nextPlanetDelay = 100;
        this.nextStarDelay = 200;
        this.nextSunDelay = 1000
        this.cameras.main.setBackgroundColor('#010B19');

        if (!this.anims.exists('star')) {
            this.anims.create({
                key: 'star',
                frames: this.anims.generateFrameNumbers('star', {start: 0, end: 5}),
                frameRate: 3,
                repeat: -1
            });
        }
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

        // On user input
        this.input.on('pointerdown', () => {

            this.handleInput();
        });

        this.input.keyboard.on('keydown-SPACE', () => {

            this.handleInput();
        });
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

        this.music.once('complete', () => {

            this.fade(true, this.FADE_DURATION);
            this.time.delayedCall(this.FADE_DURATION, () => {

                this.scene.start('evaluationscene', { score: this.totalScore, level: 2 });

            });
            

        });

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

    // Add scrolling notes
    spawnEntities() {

        while (this.spawnIndex < this.notes.length) {

            let note = this.notes[this.spawnIndex];
            let config = this.ENTITY_TIMING_CONFIG[note.type];
            let targetBeat = ((note.measure - 1) * this.TIME_SIGNATURE) + note.beat;

            let spawnBeat = targetBeat - config.anticipationBeats;

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
        const spawn = this.ENTITY_SPAWN_CONFIG[note.spawn];
        const type = this.ENTITY_TYPE_CONFIG[note.entity];

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
                this.totalScore += this.perfectPoints;
                this.perfectCount++;
                this.perfectScore.setText(`Perfect: ${this.perfectCount}`);
                break;

            case("ok"):
                this.totalScore += this.okPoints;
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