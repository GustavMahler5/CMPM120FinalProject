class Scene1 extends Phaser.Scene {
    constructor() {
        super("scene1");
        this.SCREEN_WIDTH = 1080;
        this.SCREEN_HEIGHT = 720;
    }

    preload() {}
    create() {

        let placeholder = this.add.text(
            this.SCREEN_WIDTH * 0.5, 
            this.SCREEN_HEIGHT * 0.5, 
            "Game goes here")
            .setStyle({ fontSize: `64px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

    }
    update() {}

}
