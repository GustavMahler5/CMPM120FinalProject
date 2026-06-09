// actively building in menu.js -----------------------
class CinematicsMenuPrototype1 extends BaseScene {


    constructor() {
        super({ key: "cinematicsmenuprototype1" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button", "../assets/images/menu/menu_button.png");
        this.load.image("background", "../assets/images/menu/title_bg.png");
        this.load.audio("menu", "../assets/audio/songs/menu.wav");
        this.load.image('fullscreen', "../assets/images/menu/fullscreen.png");
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xE0C6AD);
        //bgm
        let music = this.sound.add("menu", {
            volume: BaseScene.masterVolume,
            loop: true
        });
        music.play();

        this.add.image(640, 360, "background");
        
        const buttonLabels = ["Start", "Levels", "Settings", "Credits", "Exit"];
        const buttonBackground = this.add.rectangle(-200, this.SCREEN_HEIGHT / 2, this.SCREEN_WIDTH / 4, this.SCREEN_HEIGHT, 0xC1B2A2);
        const startX = -200;                           // where buttons should start x wise
        const endX = buttonBackground.width / 2;       // where buttons should end up on the screen
        const timeBetweenTweens = 150;                 // all buttons fly in one after the other, after this duration
        const flyInDuration = 1000;                    // how long it should take buttons to fly in
        const buttonStartTime = 150;                  // how long the buttons should wait before starting their tweens

        const title = this.add.text(buttonBackground.width + ((this.SCREEN_WIDTH - buttonBackground.width) / 2), -25, "Game Name",  {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#A3B2A4',
        }).setOrigin(.5, .5);
        let buttonHeight = this.SCREEN_HEIGHT / buttonLabels.length;
        const buttonWidth = Phaser.Math.Clamp(buttonHeight * 2.375, 0, buttonBackground.width - 20); // 2.375 is the aspect ratio of the button image, clamp is used to make sure buttons don't get too big for the background
        buttonHeight = buttonWidth / 2.375;

        const buttonScale = buttonWidth / 76; // 76 is the original width of the button image, this calculates the scale needed to make the button the right width for the background
        const buttonSpacing = this.SCREEN_HEIGHT / buttonLabels.length;
        const startY = buttonSpacing / 2;
        this.timeline = this.add.timeline();

        // button background tween
        this.timeline.add({
            at: 0,
            tween: {
                targets: buttonBackground,
                x: buttonBackground.width / 2,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        });
        
        buttonLabels.forEach((label, i) => {
            const x = startX;
            const y = (startY) + (buttonSpacing * i);

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

            // add to timeline
            this.timeline.add({
                at: buttonStartTime + i * timeBetweenTweens,
                tween: {
                    targets: container,
                    x: endX,
                    duration: flyInDuration,
                    ease: 'Sine.Out'
                }
            })

        });

        // title tweens
        this.timeline.add({
            at: buttonStartTime + ((buttonLabels.length + 1) * timeBetweenTweens),
            tween: {
                targets: title,
                y: 50,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        })
        this.timeline.add({
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

    }

    handleButtonClick(label) {
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
}