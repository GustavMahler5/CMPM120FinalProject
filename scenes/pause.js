class PauseScene extends BaseScene {

    constructor() {
        super('pausescene');
    }

    create() {
        // 1. Dim the background slightly (optional)
        this.add.rectangle(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT, 0x000000, 0.5).setOrigin(0).setDepth(10000);

        // 2. Add "Paused" text
        this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.5, 'Game Paused', { 
            fontSize: '32px', 
            fill: '#ffffff' 
        }).setOrigin(0.5).setDepth(10000);

        // 3. Add a resume button to go back
        this.resumeButton = this.add.text(this.SCREEN_WIDTH * 0.5, this.SCREEN_HEIGHT * 0.6, 'Resume Game', { 
            fontSize: '24px', 
            fill: '#00ff00' 
        }).setOrigin(0.5).setDepth(10000).setInteractive();

        this.resumeButton.on('pointerdown', () => {
            // 4. Resume the main scene and stop the pause screen
            this.scene.resume('gameplayprototype2'); // replace with your main scene key
            this.game.sound.resumeAll();
            this.scene.stop();
        });
    }
}