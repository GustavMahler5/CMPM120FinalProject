class CinematicsMenuPrototype1 extends BaseScene {
    
    constructor() {
        super({ key: "menu" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button", "../assets/images/menu_button.png");
        this.load.image("background", "../assets/images/title_bg.png");
        this.load.audio("menu", "../assets/audio/menu.wav");
    }

    onEnter() {
        let menu_bgm = this.sound.add("menu", {
            volume: BaseScene.masterVolume,
            loop: true
        });
        menu_bgm.play();

        this.add.image(540, 360, "background");

        const title = this.add.text(400, 100, "Game Name",  {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#A3B2A4',
        });

        const buttonLabels = ["Start", "Levels", "Settings", "Credits", "Exit"];  
        const buttonStart = 500

        const handleButtonClick = (label) => {
            // not fully implemented yet, so button clicks will be disabled until then
            switch(label) {
                case "Start":    
                    this.changeScene("gameplayprototype2");
                    break;
                
                case "Levels":
                    this.changeScene("levelselectprototype");
                    break;
    
                case "Settings": 
                    this.changeScene("settingsprototype");
                    break;
    
                case "Credits":  
                    this.changeScene("creditsprototype");
                    break;
    
                case "Exit":
                    this.changeScene("LogoScene");
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
                button.setTint(0xdddddd);
            });
            button.on("pointerup", () => {
                button.clearTint();
                this.handleButtonClick(label);
            });        

            this.tweens.add({
                targets: container,
                y: this.SCREEN_HEIGHT / 3 + i * this.SCREEN_HEIGHT / 8,
                delay: i * 600,
                duration: 3000,
                ease: 'linear'
            })
        });


    /*    const timeline = this.add.timeline({
            at: buttonStart * i + 300,
            tween: {
                targets: container,
                y: 300 + (i * 50),
                duration: 1000,
                ease: 'linear'
            },
        });
        this.timeline.play();
    */


//        text.setScale(Math.min(1, (buttonWidth - 20) / text.width));

    
    /*    const buttonBackground = this.add.rectangle(-200, this.SCREEN_HEIGHT / 2, this.SCREEN_WIDTH / 4, this.SCREEN_HEIGHT, 0xC1B2A2);
        const timeBetweenTweens = 150;                 // all buttons fly in one after the other, after this duration
        const flyInDuration = 1000;                    // how long it should take buttons to fly in
        const buttonStartTime = 150;                  // how long the buttons should wait before starting their tweens


        let buttonHeight = this.SCREEN_HEIGHT / buttonLabels.length;
        const buttonWidth = Phaser.Math.Clamp(buttonHeight * 2.375, 0, buttonBackground.width - 20); // 2.375 is the aspect ratio of the button image, clamp is used to make sure buttons don't get too big for the background
        buttonHeight = buttonWidth / 2.375;
        const buttonScale = buttonWidth / 76; // 76 is the original width of the button image, this calculates the scale needed to make the button the right width for the background
        const buttonSpacing = this.SCREEN_HEIGHT / buttonLabels.length;

        buttonLabels.forEach((label, i) => {
            const x = 540;
            const y = -100;

            const button = this.add.image(0, 0, "menu_button").setScale(buttonScale);
            const text = this.add.text(0, 0, label, {
                fontSize: '32px', 
                fill: '#fff',
                align: 'center'
            })
            .setOrigin(0.5, 0.5);
            text.setScale(Math.min(1, (buttonWidth - 20) / text.width));

            // buttons + text are grouped into containers for easier use
            const container = this.add.container(x, y, [button, text]);
            container.setSize(button.displayWidth, button.displayHeight);
            button.setInteractive();

            // hover + click events
            button.on("pointerover", () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale + (buttonScale / 8),
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            button.on("pointerout",  () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            button.on("pointerdown", () => {
                button.setTint(0xdddddd);
            });
            button.on("pointerup", () => {
                button.clearTint();
                // removed, as scenes haven't been made yet
                this.handleButtonClick(label);
            });
        });

        this.timeline.add({ //button background
            at: 0,
            tween: {
                targets: buttonBackground,
                x: buttonBackground.width / 2,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        });

        this.timeline.add({
            at: buttonStartTime + i * timeBetweenTweens,
            tween: {
                targets: container,
                x: endX,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        });

        this.timeline.add({ //title
            at: buttonStartTime + ((buttonLabels.length + 1) * timeBetweenTweens),
            tween: {
                targets: title,
                y: 50,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        })
        this.timeline.add({ //title
            at: buttonStartTime + ((buttonLabels.length + 1) * timeBetweenTweens) + flyInDuration,
            tween: {
                targets: title,
                y: 60,
                duration: 1500,
                yoyo: true,
                ease: 'Sine.InOut',
                repeat: -1
            }
        })

        this.timeline.play();

        //add button handling
       */ 
    }
}
