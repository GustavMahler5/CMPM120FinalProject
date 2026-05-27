/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class LogoScene extends BaseScene {

    constructor() {
        super({ key: "LogoScene" });
    }

    preload() {
        this.load.setBaseURL('./');

        this.load.image('toastPerspective','../assets/images/cinematic/toastPerspective.png');
        this.load.image('J','../assets/images/cinematic/J.png');
        this.load.image('jPan','../assets/images/cinematic/jPan.png');
        this.load.image('egg','../assets/images/cinematic/egg.png');
        this.load.image('crackedEgg','../assets/images/cinematic/crackedEgg.png');
        this.load.image('eggOnToast','../assets/images/cinematic/eggOnToast.png');



    }

    onEnter() {
        const w = this.scale.width;
        const h = this.scale.height;

        let logoText = this.add.text(
            w * 0.25,
            h * 0.45,
            'Jeggs  & Toast',
            {
                fontSize: '63px',
                fontStyle: 'bold',
                color: '#ffffff',
                depth:10,
            }
        ) 
        .setAlpha(0);

        this.cameras.main.setBackgroundColor(0xC7C7C7);

        let toastPerspective = this.add.image(w * 0.68, h * 1.2, 'toastPerspective').setScale(0.3).setVisible(false);
        let jPan = this.add.image(w * 0.38, h * 0.5, 'jPan').setScale(0.5);
        let crackedEgg = this.add.image(w * 0.28, h * 0.35, 'crackedEgg').setScale(0.3).setVisible(false);
        let eggOnToast = this.add.image(w * 0.29, h * 0.65, 'eggOnToast').setScale(0.3).setVisible(false).setAngle(24);

        this.tweens.chain({
            tweens: [


                {
                    delay: 1000,
                    targets: crackedEgg,
                    x: w * 0.28,
                    y: h * 0.33,

                    duration: 300,
                    onStart: () => {
                    crackedEgg.setVisible(true);
                    }
                },

                {
                    targets: eggOnToast,
                    duration: 100,
                    x: w * 0.29,
                    y: h * 0.69,
                    hold: 600,
                    onStart: () => {
                        
                    eggOnToast.setVisible(true);
                    },

                    hold: 400,
                    onComplete: () => {
                    crackedEgg.setVisible(false);

                    }
                    

                },
                {
                    targets: jPan,
                    x: w * 0.38,
                    y: h * 0.69,
                    duration: 100,
                    delay: 800,
                    scaleY: -0.5,
                    yoyo: true,
                    hold: 800,

                    onStart: () => {
                        toastPerspective.setVisible(true);

                        this.tweens.add({
                            targets: eggOnToast,
                            x: w * 0.6,
                            y: h * -5.0,
                            duration: 800
                        });

                        this.tweens.add({
                            targets: toastPerspective,
                            y: h * 0.65,
                            duration: 500
                        });
                    
                    
                    },

                    hold: 350,
                    onComplete: () => {
                    crackedEgg.setVisible(false);

                            this.tweens.add({
                            targets: eggOnToast,
                            x: w * 0.68,
                            y: h * 0.65,
                            duration: 300
                        });

                    }
                    

                },
                {
                    targets: [eggOnToast, toastPerspective],
                    delay:500,
                    duration: 300,
                    x: w * 0.6,
                    y: h * 0.6,

                    onStart: () => {
                    jPan.setTexture('J');
                    },
                },
                {
                    targets: logoText,
                    alpha: 1,
                    duration: 1000,
                    hold: 2000,
                    onComplete: () => {
                        this.changeScene("CinematicsMenuPrototype");
                    }
                },
            ]
        });

//chain.play();
    }
}

class CinematicsMenuPrototype extends BaseScene {


    constructor() {
        super({ key: "CinematicsMenuPrototype" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button_prototype", "../assets/images/menu_button_prototype.png");
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xE0C6AD);
        
        const buttonScale = 3;          // used for scaling buttons, can be modified if new assets need different scales
        const buttonBackground = this.add.rectangle(-200, this.SCREEN_HEIGHT / 2, this.SCREEN_WIDTH / 4, this.SCREEN_HEIGHT, 0xC1B2A2);

        const buttonSpacing = 120;                     // vertical gap between buttons
        const startY = 200;                            // y position of the first button
        const startX = -200;                           // where buttons should start x wise
        const endX = buttonBackground.width / 2;       // where buttons should end up on the screen
        const timeBetweenTweens = 150;                 // all buttons fly in one after the other, after this duration
        const flyInDuration = 1000;                    // how long it should take buttons to fly in
        const buttonStartTime = 150;                  // how long the buttons should wait before starting their tweens

        const buttonLabels = ["Start", "Settings", "Credits", "Exit"];
        const title = this.add.text(buttonBackground.width + ((this.SCREEN_WIDTH - buttonBackground.width) / 2), -25, "Game Name",  {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#A3B2A4',
        }).setOrigin(.5, .5);

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
            const y = startY + i * buttonSpacing;

            const button = this.add.image(0, 0, "menu_button_prototype").setScale(buttonScale);
            const text = this.add.text(0, 0, label, {
                fontSize: '32px', 
                fill: '#fff'
            })
            .setOrigin(.5, .5);

            // buttons + text are grouped into containers for easier use
            const container = this.add.container(x, y, [button, text]);

            container.setSize(button.displayWidth, button.displayHeight);
            container.setInteractive();

            // hover + click events
            container.on("pointerover", () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale + (buttonScale / 8),
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            container.on("pointerout",  () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            container.on("pointerdown", () => {
                button.setTint(0xdddddd);
            });
            container.on("pointerup", () => {
                button.clearTint();
                // removed, as scenes haven't been made yet
                this.handleButtonClick(label)
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
                this.changeScene("gameplayprototype");
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


class SettingsPrototype extends BaseScene {
    constructor() {
        super({ key: "settingsprototype" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button_prototype", "../assets/images/menu_button_prototype.png");
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xADE0C6);
        
        const buttonScale = 3;          // used for scaling buttons, can be modified if new assets need different scales
        const buttonBackground = this.add.rectangle(this.SCREEN_WIDTH + 200, this.SCREEN_HEIGHT / 2, this.SCREEN_WIDTH / 4, this.SCREEN_HEIGHT, 0xA2C1B2);

        const buttonSpacing = 120;                                      // vertical gap between buttons
        const startY = 200;                                              // y position of the first button
        const startX = this.SCREEN_WIDTH + 200;                                            // where buttons should start x wise
        const endX = this.SCREEN_WIDTH - (buttonBackground.width / 2); // where buttons should end up on the screen
        const timeBetweenTweens = 150;                                   // all buttons fly in one after the other, after this duration
        const flyInDuration = 1000;                                     // how long it should take buttons to fly in
        const buttonStartTime = 150;                                    // how long the buttons should wait before starting their tweens

        const buttonLabels = ["Configuration (Not implemented yet)", "Volume (Not implemented yet)", "Back"];
        const title = this.add.text(((this.SCREEN_WIDTH - buttonBackground.width) / 2), -30, "Settings",  {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#A3B2A4',
        }).setOrigin(.5, .5);

        this.timeline = this.add.timeline();

        // button background tween
        this.timeline.add({
            at: 0,
            tween: {
                targets: buttonBackground,
                x: this.SCREEN_WIDTH - (buttonBackground.width / 2),
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        });

        buttonLabels.forEach((label, i) => {
            const x = startX;
            const y = startY + i * buttonSpacing;

            const button = this.add.image(0, 0, "menu_button_prototype").setScale(buttonScale);
            const text = this.add.text(0, 0, label, {
                fontSize: '24px', 
                fill: '#fff'
            })
            .setOrigin(.5, .5);

            // buttons + text are grouped into containers for easier use
            const container = this.add.container(x, y, [button, text]);

            container.setSize(button.displayWidth, button.displayHeight);
            container.setInteractive();

            // hover + click events
            container.on("pointerover", () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale + (buttonScale / 8),
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            container.on("pointerout",  () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            container.on("pointerdown", () => {
                button.setTint(0xdddddd);
            });
            container.on("pointerup", () => {
                button.clearTint();
                // removed, as scenes haven't been made yet
                this.handleButtonClick(label)
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
            case "Configuration":    
                this.changeScene("gameplayprototype");
                break;

            case "Volume": 
                this.changeScene("settingsprototype");
                break;

            case "Back":  
                this.changeScene("CinematicsMenuPrototype");
                break;

        }
    }
}

class CreditsPrototype extends BaseScene {
    constructor() {
        super({ key: "creditsprototype" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button_prototype", "../assets/images/menu_button_prototype.png");
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xC6ADE0);
        
        const buttonScale = 3;          // used for scaling buttons, can be modified if new assets need different scales
        const buttonBackground = this.add.rectangle(this.SCREEN_WIDTH + 200, this.SCREEN_HEIGHT / 2, this.SCREEN_WIDTH / 4, this.SCREEN_HEIGHT, 0xB2A2C1);

        const buttonSpacing = 120;                                      // vertical gap between buttons
        const startY = 65;                                              // y position of the first button
        const startX = this.SCREEN_WIDTH + 200;                                            // where buttons should start x wise
        const endX = this.SCREEN_WIDTH - (buttonBackground.width / 2); // where buttons should end up on the screen
        const timeBetweenTweens = 150;                                   // all buttons fly in one after the other, after this duration
        const flyInDuration = 1000;                                     // how long it should take buttons to fly in
        const buttonStartTime = 150;                                    // how long the buttons should wait before starting their tweens

        const buttonLabels = ["Jason Holtman", "Beck Grah", "Jayla Lackaff", "Kajol Prasad", "Adam Top", "Back"];
        const title = this.add.text(((this.SCREEN_WIDTH - buttonBackground.width) / 2), -30, "Credits",  {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#A3B2A4',
        }).setOrigin(.5, .5);

        this.timeline = this.add.timeline();

        // button background tween
        this.timeline.add({
            at: 0,
            tween: {
                targets: buttonBackground,
                x: this.SCREEN_WIDTH - (buttonBackground.width / 2),
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        });

        buttonLabels.forEach((label, i) => {
            const x = startX;
            const y = startY + i * buttonSpacing;

            const button = this.add.image(0, 0, "menu_button_prototype").setScale(buttonScale);
            const text = this.add.text(0, 0, label, {
                fontSize: '24px', 
                fill: '#fff'
            })
            .setOrigin(.5, .5);

            // buttons + text are grouped into containers for easier use
            const container = this.add.container(x, y, [button, text]);

            container.setSize(button.displayWidth, button.displayHeight);
            container.setInteractive();

            // hover + click events
            container.on("pointerover", () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale + (buttonScale / 8),
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            container.on("pointerout",  () => {
                this.add.tween({
                    targets: button,
                    scale: buttonScale,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            container.on("pointerdown", () => {
                button.setTint(0xdddddd);
            });
            container.on("pointerup", () => {
                button.clearTint();
                // removed, as scenes haven't been made yet
                this.handleButtonClick(label)
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

            case "Back":  
                this.changeScene("CinematicsMenuPrototype");
                break;

        }
    }
}


class CinematicsPrototype extends BaseScene {

    constructor() {

        super("cinematicsprototype");

    }

    preload() {}

    onEnter() {

        let placeholder = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "Cinematic prototyping goes here")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

        //this.scene.start("CinematicsMenuPrototype");
        this.scene.start("LogoScene");


    }

    update() {}
}