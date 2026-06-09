class MenuScene extends BaseScene {
    
    constructor() {
        super({ key: "menu" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button", "../assets/images/menu/menu_button.png");
        this.load.image("menu_bg", "../assets/images/menu/menubackground1st.png");
        this.load.audio("menu", "../assets/audio/songs/menu.wav");
        this.load.audio("button_sfx", "../assets/audio/SFX/menu/selection.mp3");
        this.load.audio("button_hover", "../assets/audio/SFX/menu/hoverSelection.mp3");
        this.load.image('fullscreen', "../assets/images/menu/fullscreen.png");
        this.load.image('title', "../assets/images/menu/title_icon.png");
        this.load.image("menu_ufo", "../assets/images/menu/menuufo.png");
        this.load.image("menu_cow", "../assets/images/menu/menucow.png");
        this.load.image("menu_biglight", "../assets/images/menu/biglight.png");
        this.load.image("menu_smalllights", "../assets/images/menu/smalllights.png");
        this.load.image("flycow", "../assets/images/menu/flycow.png");
        this.load.image('cow', '../assets/images/menu/cow.png');
    }

    onEnter() {
        this.sound.volume = BaseScene.masterVolume;

        // if (BaseScene.currentMusic) BaseScene.currentMusic.stop();
        let menu_bgm = this.sound.add("menu", {
            volume:  BaseScene.musicVolume,
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

        this.background = this.add.image(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT / 2, "menu_bg").setScale(0.44);

        const flyCow = this.add.image(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT - 110, "flycow").setScale(0.14);

        const menuCow = this.add.image(600, -50, "menu_cow").setScale(0.44).setFlipX(true);
        menuCow.setRotation(0);

        const bigLight = this.add.image(540, 340, "menu_biglight").setScale(0.44).setAlpha(0);

        const menuUfo = this.add.image(540, -500, "menu_ufo").setScale(0.44);

        const smallLights = this.add.image(540, 340, "menu_smalllights").setScale(0.44).setAlpha(0);

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
                    this.game.destroy(true);
                    window.close();
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

            this.cow = this.add.image(this.SCREEN_WIDTH / 4.8, this.SCREEN_HEIGHT + 100, 'cow');
            this.cow.setOrigin(0.5);
            this.tweens.chain({
                targets: this.cow,
                tweens: [
                    {
                        y: this.SCREEN_HEIGHT / 3,
                        delay: 1200,
                        duration: 3000,
                        ease: 'linear'
                    },
                    {
                        ease: 'linear',
                        y: this.SCREEN_HEIGHT / 3 + this.SCREEN_HEIGHT / 10,
                        duration: 2000,
                        yoyo: true,
                        loop: -1
                    }
                ]
            })
            
        });

        this.tweens.add({
            targets: menuUfo,
            y: 340,
            duration: 1200,
            ease: 'Cubic.Out',
            onComplete: () => {
                this.tweens.add({
                    targets: bigLight,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        this.tweens.add({
                            targets: smallLights,
                            alpha: 1,
                            duration: 800,
                            ease: 'Linear'
                        });
                        this.tweens.add({
                            targets: flyCow,
                            y: -300,
                            rotation: Phaser.Math.DegToRad(720),
                            duration: 1400,
                            ease: 'Cubic.In',
                            onComplete: () => {
                                this.tweens.add({
                                    targets: menuCow,
                                    x: 830,
                                    y: 260,
                                    rotation: Phaser.Math.DegToRad(-60),
                                    duration: 1400,
                                    ease: 'Cubic.Out'
                                });
                            }
                        });
                    }
                });
            }
        });
        // fx
       // const blurEffect = this.background.postFX.addBlur(0, 2, 2, 100); 
        this.cameras.main.shake(4000, new Phaser.Math.Vector2(0, 0.002));

       //this.title.preFX.addGlow(0xffffff, 2, 0, false);
    }
}