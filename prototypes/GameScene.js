class GameScene extends BaseScene {

    constructor() {
        super('GameScene');
    }

    preload() {

        this.load.audio('tick', '../assets/audio/tick.wav');

        this.load.image('catDefault', '../assets/images/gameplay/catDefault.png');

        this.load.image('ball', '../assets/images/gameplay/ball.png');
        this.load.image('ballWin', '../assets/images/gameplay/ballWin.png');

        this.load.image('catTreat', '../assets/images/gameplay/catTreat.png');
        this.load.image('treatWin', '../assets/images/gameplay/treatWin.png');

        this.load.image('sprayBottle', '../assets/images/gameplay/sprayBottle.png');
        this.load.image('sprayBottleWin', '../assets/images/gameplay/sprayBottleWin.png');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.cat = this.add.image(
            w * 0.8,
            h * 0.7,
            'catDefault'
        );

        this.startTime = this.time.now;


        this.measureLength = 3000; //  TEMPO
        this.beatLength = this.measureLength / 4;

        this.activeNotes = [];
        this.spawnChance = 0.2; // OVERALL NOTE SPAWN CHANCE PER BEAT

        this.noteCooldowns = {
            ball: 0,
            treat: 0,
            spray: 0

        };
        this.noteTypes = {
            ball: {
                texture: 'ball',
                winTexture: 'ballWin',
                beats: 4,
                weight: 1,
                animation: 'ballBounce'
            },
            treat: {
                texture: 'catTreat',
                winTexture: 'treatWin',
                beats: 3,
                weight: 2,
                animation: 'treatThrow'
            },
            spray: {
                texture: 'sprayBottle',
                winTexture: 'sprayBottleWin',
                beats: 2,
                weight: 3,
                animation: 'sprayThreat'
            }
        };

        this.tickSound = this.sound.add('tick');
            this.time.addEvent({
                delay: this.beatLength,
                loop: true,
                callback: () => {
                    this.tickSound.play({
                        volume: 0.0
                    });
                    // reduce cooldowns by 1 beat
                    for (let noteName in this.noteCooldowns) {
                        if (this.noteCooldowns[noteName] > 0) {
                            this.noteCooldowns[noteName]--;
                        }
                    }
                    if (Math.random() < this.spawnChance) {
                        this.spawnRandomNote();
                    }
                }
            });

        this.hitWindow = 300;

            this.timingText = this.add.text(
                w * 0.5,
                h * 0.15,
                'Timing:',
                {
                    fontSize: '32px',
                    color: '#ffffff'
                }
                ).setOrigin(0.5);   

            this.input.on('pointerdown', () => {

                let currentTime = this.time.now - this.startTime;
                if (this.activeNotes.length === 0) { // for when clicking when no note are active
                    return;
                }

                let closestNote = null; 
                let closestDifference = Infinity;
                
                for (let activeNote of this.activeNotes) {
                    let difference = Math.abs(currentTime - activeNote.targetTime);

                    if (difference < closestDifference) {
                        closestDifference = difference;
                        closestNote = activeNote;
                    }
                }

                if (closestDifference <= this.hitWindow) {
                    this.cat.setTexture(closestNote.winTexture);
                    this.timingText.setText('Hit, Difference: ' + closestDifference.toFixed(0) + 'ms');

                    closestNote.object.destroy();

                    this.activeNotes = this.activeNotes.filter(activeNote => {
                        return activeNote !== closestNote;
                    });
                } else {
                    this.timingText.setText('Miss, Difference: ' + closestDifference.toFixed(0) + 'ms');
                }

                this.time.delayedCall(250, () => {
                    this.cat.setTexture('catDefault');
                });

            });

    }
    
    spawnRandomNote() {
        let noteName = this.pickWeightedNote();
        let noteData = this.noteTypes[noteName];
        if (this.noteCooldowns[noteName] > 0) {
            return;
        }

        let duration = this.beatLength * noteData.beats;
        let targetTime = this.time.now - this.startTime + duration;
        let landingTaken = this.activeNotes.some(activeNote => {
            return Math.abs(activeNote.targetTime - targetTime) < 10;
            });

            if (landingTaken) {
                return;
            }

        let note = this.createNoteAnimation(noteName, noteData, duration);

        this.activeNotes.push({
            object: note,
            targetTime: targetTime,
            winTexture: noteData.winTexture
        });
        this.noteCooldowns[noteName] = noteData.beats + 1;

        this.tweens.add({
            targets: note,
            x: this.cat.x,
            y: this.cat.y,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                note.destroy();

                this.activeNotes = this.activeNotes.filter(activeNote => {
                    return activeNote.object !== note;
                });
            }
        });
    }
    
    createNoteAnimation(noteName, noteData, duration) {
        let note = this.add.image(
            this.scale.width * 0.1,
            this.scale.height * 0.7,
            noteData.texture
        ).setScale(0.2);

        if (noteName === 'ball') {
            this.tweens.add({
                targets: note,
                y: note.y - 80,
                duration: duration / 8,
                yoyo: true,
                repeat: 3,
                ease: 'Sine.Out'
            });
        }

        if (noteName === 'treat') {
            note.setY(this.scale.height * 0.4);
        }

        if (noteName === 'spray') {
            note.setX(this.scale.width * 0.4);
            note.setY(this.scale.height * 0.7);
        }

        return note;
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