class Start extends BaseScene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', '../assets/images/gameplay/space.png');
        this.load.image('logo', '../assets/images/gameplay/phaser.png');

        //  The ship sprite is CC0 from https://ansimuz.itch.io - check out his other work!
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        this.scene.start('GameScene');

    }

    update() {
        this.background.tilePositionX += 2;
    }
    
}
