class MenuScene extends BaseScene {
    
    constructor() {
        super({ key: "menu" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button", "../assets/images/menu/menu_button.png");
        this.load.image("background", "../assets/images/menu/title_bg.png");
        this.load.audio("menu", "../assets/audio/songs/menu.wav");
        this.load.audio("button_sfx", "../assets/audio/SFX/menu/selection.mp3");
        this.load.audio("button_hover", "../assets/audio/SFX/menu/hoverSelection.mp3");
        this.load.image('fullscreen', "../assets/images/menu/fullscreen.png");
    }

    onEnter() {
        let menu_bgm = this.sound.add("menu", {
            volume: BaseScene.masterVolume,
            loop: true
        });
        menu_bgm.play();

        let button_sfx = this.sound.add("button_sfx", {
            volume: BaseScene.masterVolume,
        });

        let button_hover = this.sound.add("button_hover", {
            volume: BaseScene.masterVolume,
        });

        this.background = this.add.image(540, 340, "background").setScale(1.1);

        const title = this.add.text(400, 100, "Game Name",  {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#A3B2A4',
        });

        const buttonLabels = ["Levels", "Settings", "Credits", "Exit"];  
        const buttonStart = 500

        const handleButtonClick = (label) => {
            switch(label) {
                case "Levels":
                    this.changeScene("levelselect");
                    break;
    
                case "Settings":
                    this.scene.launch("settings2"); // overlays menu
                    this.scene.pause();
                    break;
    
                case "Credits":  
                    this.changeScene("credits");
                    break;
    
                case "Exit":
                    this.changeScene("logo");
                    break;
            }
        }

        buttonLabels.forEach((label, i) => {
            const button = this.add.image(0, 0, "menu_button")
            const text = this.add.text(0, 0, label, {
                fontSize: '32px', 
                fill: '#fff',
                align: 'center'
            })
            .setOrigin(0.5, 0.5);
            text.setScale(Math.min(1, (button.width - 20) / text.width));

            button.setInteractive()

            const container = this.add.container((this.SCREEN_WIDTH / 2) + (this.SCREEN_WIDTH / 300), (this.SCREEN_HEIGHT + 100), [button, text])
            container.setSize(button.displayWidth, button.displayHeight).setScale((this.SCREEN_HEIGHT / 400));

            // hover + click events
            button.on("pointerover", () => {
                this.sound.play("button_hover");
                this.add.tween({
                    targets: container,
                    scale: this.SCREEN_HEIGHT / 300,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            button.on("pointerout",  () => {
                this.add.tween({
                    targets: container,
                    scale: this.SCREEN_HEIGHT / 400,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            button.on("pointerdown", () => {
                this.sound.play("button_sfx");
                button.setTint(0xdddddd);
                handleButtonClick(label);
            });
            button.on("pointerup", () => {
                button.clearTint();
                handleButtonClick(label);
            });        

            this.tweens.add({
                targets: container,
                y: this.SCREEN_HEIGHT / 3 + i * this.SCREEN_HEIGHT / 8,
                delay: i * 600,
                duration: 3000,
                ease: 'linear'
            })
        });

        // fx
        //this.cameras.main.shake(10000000, .001, true);

        const blurEffect = this.background.postFX.addBlur(0, 2, 2, 100); 


       
    }
}