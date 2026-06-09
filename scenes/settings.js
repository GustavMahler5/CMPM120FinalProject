class SettingsScene extends BaseScene {
    
    constructor() {
        super({ key: "settings" });
    }

    preload() {
        this.load.image('fullscreen', "assets/images/menu/fullscreen.png");
    }

    onEnter() {        
        this.sound.volume = BaseScene.masterVolume;
        this.graphics = this.add.graphics();
        
        this.graphics.fillStyle("0xf542dd");
        this.graphics.fillRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

        const title = this.add.text(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT / 2, "Settings",  {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#A3B2A4',
        });

        // slider params
        const trackX = this.SCREEN_WIDTH / 2;
        const trackY = this.SCREEN_HEIGHT / 2;
        const width = this.SCREEN_WIDTH / 2;
        const height = this.SCREEN_HEIGHT / 5;
        const dragRadius = 10;

        // slider track
        const track = this.add.rectangle(trackX, trackY, width, height, 0x000000);
        
        const dragger = this.add.circle(trackX, trackY, dragRadius, 0xffffff);
        dragger.setInteractive({ useHandCursor: true });
        
        this.input.setDraggable(dragger);
        const minX = trackX;
        const maxX = trackX + width;

       //this.input.on('drag', (pointer, ))


        // this.scene.resume("menu"); this.scene.stop() on exit
    }

}

