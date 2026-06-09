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
        this.load.image('title', "../assets/images/menu/title_icon.png");
    }

    onEnter() {
        this.sound.volume = BaseScene.masterVolume;

        if (BaseScene.currentMusic) BaseScene.currentMusic.stop();
        let menu_bgm = this.sound.add("menu", {
            volume: BaseScene.musicVolume,
            loop: true
        });
        menu_bgm.play();
        BaseScene.currentMusic = menu_bgm;

        let button_sfx = this.sound.add("button_sfx", {
            volume: BaseScene.sfxVolume,
        });

        let button_hover = this.sound.add("button_hover", {
            volume: BaseScene.sfxVolume,
        });

        this.background = this.add.image(540, 340, "background").setScale(1.1);

        this.title = this.add.image(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT + 100, "title");


        const buttonLabels = ["Levels", "Settings", "Credits", "Exit"];  
        const buttonStart = 500

        const handleButtonClick = (label) => {
            switch(label) {
                case "Levels":
                    this.changeScene("levelselect");
                    break;
    
                case "Settings":
                    this.changeScene("settings2"); // overlays menu
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
                button_hover.play();
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
                button_sfx.play();
                button.setTint(0xdddddd);
                handleButtonClick(label);
            });
            button.on("pointerup", () => {
                button.clearTint();
                handleButtonClick(label);
            });        

            this.tweens.add({
                targets: this.title,
                y: this.SCREEN_HEIGHT / 4,
                duration: 2000
            })

            this.tweens.add({
                targets: container,
                y: this.SCREEN_HEIGHT / 2.2 + i * this.SCREEN_HEIGHT / 8,
                delay: 600 + i * 600,
                duration: 2000,
                ease: 'linear'
            })
        });

        // fx
        //this.cameras.main.shake(10000000, .001, true);

       // const blurEffect = this.background.postFX.addBlur(0, 2, 2, 100); 


       
    }
}