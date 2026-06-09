class PauseScene extends BaseScene {

    constructor() {
        super('pausescene');
    }

    create(data) {

        let level = data.level;
        BaseScene.pausedLevel = level;

        this.add.rectangle(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT, 0x000000, 0.5).setOrigin(0).setDepth(10000);

        this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.5, 'Game Paused', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(1000);

        this.resumeButton = this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.6, 'Resume Game', {
            fontSize: '24px',
            fill: '#00ff00'
        }).setOrigin(0.5).setDepth(1000).setInteractive();

        this.resumeButton.on('pointerdown', () => {
            BaseScene.pausedLevel = null;
            this.scene.resume(`${level}`);
            this.game.sound.resumeAll();
            this.scene.stop();
        });

        this.settingsButton = this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.7, 'Settings', {
            fontSize: '24px',
            fill: '#00ff00'
        }).setOrigin(0.5).setDepth(1000).setInteractive();

        this.settingsButton.on('pointerdown', () => {
            this.scene.start('settings2');
        });
    }
}