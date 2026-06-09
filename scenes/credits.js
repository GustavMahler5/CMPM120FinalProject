class CreditsScene extends BaseScene {
    constructor() {
        super({ key: "credits" });
    }

    preload() {
        super.preload();
        this.load.image("menu_button", "assets/images/menu/menu_button.png");
        this.load.image('fullscreen', "assets/images/menu/fullscreen.png");
    }

    onEnter() {
        this.sound.volume = BaseScene.masterVolume;
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

        const buttonLabels = [
            "Jason Holtman", 
            "Beck Grah", 
            "Jayla Lackaff", 
            "Kajol Prasad", 
            "Adam Top", 
            // "Orbweaver", Credits to Jason's friend for helping with music and sfx productions
            "Back"];
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

            const button = this.add.image(0, 0, "menu_button").setScale(buttonScale);
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
                this.changeScene("menu");
                break;

        }
    }
}