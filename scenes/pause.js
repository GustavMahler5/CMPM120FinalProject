class PauseScene extends BaseScene {

    constructor() {
        super('pausescene');
    }

    create(data) {

        let level = data.level;
        BaseScene.pausedLevel = level;

        this.add.rectangle(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT, 0x000000, 0.5).setOrigin(0).setDepth(999);

        this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.3, 'Game Paused', {
            fontSize: '64px',
            fill: '#FFFFFF',
        }).setOrigin(0.5).setDepth(1000);

        this.resumeButton = this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.5, 'Resume Game', {
            fontSize: '32px',
            fill: '#00FF00'
        }).setOrigin(0.5).setDepth(1000).setInteractive();

        this.resumeButton.on('pointerdown', () => {
            BaseScene.pausedLevel = null;
            this.scene.resume(`${level}`);
            this.game.sound.resumeAll();
            this.scene.stop();
        });

        this.settingsButton = this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.6, 'Settings', {
            fontSize: '32px',
            fill: '#00FF00'
        }).setOrigin(0.5).setDepth(1000).setInteractive();

        this.settingsButton.on('pointerdown', () => {
            this.scene.start('settings2');
        });

        this.quitButton = this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.7, 'Quit', {
            fontSize: '32px',
            fill: '#00FF00'
        }).setOrigin(0.5).setDepth(1000).setInteractive();

        this.quitButton.on('pointerdown', () => {
             this.game.sound.stopAll();

            if (level) {
                this.scene.stop(level);
            }

            BaseScene.pausedLevel = null;

            this.scene.start('levelselect');
        });
    }
}