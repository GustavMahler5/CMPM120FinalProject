/*
Have all scenes extend the custom engine for this project: "Engine"
We will put all global variables and static functions into engine.js 
to maintain code readability and neatness.
*/

class CinematicsMenuPrototype extends Engine {
    constructor() {
        super({ key: "CinematicsMenuPrototype" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button_prototype", "../assets/images/menu_button_prototype.png");
    }

    create() {
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
                // this.handleButtonClick(label)
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
            case "Start":    this.scene.start("GameplayPrototype"); break;
            case "Settings": this.scene.start("SettingsPrototype"); break;
            case "Credits":  this.scene.start("CreditsPrototype");  break;
            case "Exit":     /* handle exit */ break;
        }
    }
}

class CinematicsPrototype extends Engine {

    constructor() {

        super("cinematicsprototype");

    }

    preload() {}

    create() {

        let placeholder = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "Cinematic prototyping goes here")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

        this.scene.start("CinematicsMenuPrototype");

    }

    update() {}
}