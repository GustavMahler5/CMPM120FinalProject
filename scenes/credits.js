class CreditsScene extends BaseScene{
    constructor() {
        super("credits");
    }
    
    preload() {
        //super.preload();
        this.load.image("menu_button", "../assets/images/menu/menu_button.png");
        this.load.audio('menu', '../assets/audio/songs/menu.wav');
        this.load.audio('hover', '../assets/audio/sfx/menu/hoverSelection.mp3');
        this.load.audio('selection', '../assets/audio/sfx/menu/selection.mp3');
        this.load.image('fullscreen', "../assets/images/menu/fullscreen.png");
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xb934f7);

        this.hoverSFX = this.sound.add('hover');
        this.selectionSFX = this.sound.add('selection');

        // add scene here to create button
        const names = [
            { label: "Jason Holtman" },
            { label: "Beck Grah" },
            { label: "Jayla Lackaff" },
            { label: "Kajol Prasad" },
            { label: "Adam Top" },
            { label: "name" },
            { label: "name" },
            { label: "name" },
            { label: "name" }
        ]

        const startX = -200;                           // where buttons should start x wise
        const endX = this.SCREEN_WIDTH / 8;       // where buttons should end up on the screen
        const timeBetweenTweens = 150;                 // all buttons fly in one after the other, after this duration
        const flyInDuration = 1000;                    // how long it should take buttons to fly in
        const buttonStartTime = 150;                  // how long the buttons should wait before starting their tweens

        const title = this.add.text(((this.SCREEN_WIDTH) / 2), -25, "Credits",  {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#2d0350',
        }).setOrigin(.5, .5);
        let buttonHeight = (this.SCREEN_HEIGHT - 100) / Math.floor(names.length / 6);
        const buttonWidth = Phaser.Math.Clamp(buttonHeight * 2.375, 0, (this.SCREEN_WIDTH / 4) - 20); // 2.375 is the aspect ratio of the button image, clamp is used to make sure buttons don't get too big for the background
        buttonHeight = buttonWidth / 2.375;

        const buttonScale = buttonWidth / 76; // 76 is the original width of the button image, this calculates the scale needed to make the button the right width for the background
        let buttonSpacing;
        if (names.length > 6) {
            buttonSpacing = ((this.SCREEN_HEIGHT - 100) / 6) + 20;
        }
        else {
            buttonSpacing = ((this.SCREEN_HEIGHT - 100) / names.length) + 20;
        }
        const startY = 100 + buttonSpacing / 2;
        this.timeline = this.add.timeline();

        const numCols = 4;
        const lastRowCount = names.length % numCols || numCols;
        const numRows = Math.ceil(names.length / numCols);

        names.forEach((name, i) => {
            const x = startX;
            const y = (startY) + (buttonSpacing * Math.floor(i / numCols));

            const button = this.add.image(0, 0, "menu_button").setScale(buttonScale);
            const text = this.add.text(0, 0, name.label, {
                fontSize: '32px',
                fontStyle: 'bold',
                fill: '#fff',
                align: 'center'
            })
            .setOrigin(0.5, 0.5);
            text.setScale(Math.min(1, (buttonWidth - 40) / text.width));


            // buttons + text are grouped into containers for easier use
            const container = this.add.container(x, y, [button, text]);
            container.setSize(button.displayWidth, button.displayHeight);

            const isLastRow = Math.floor(i / numCols) === numRows - 1;
            let rowOffset;
            if (isLastRow) {
                rowOffset = (buttonWidth + 20) * (numCols - lastRowCount) / 2
            }
            else {
                rowOffset = 0;
            }

            // add to timeline
            this.timeline.add({
                at: buttonStartTime + i * timeBetweenTweens,
                tween: {
                    targets: container,
                    x: endX + ((buttonWidth + 20) * (i % numCols)) + rowOffset,
                    duration: flyInDuration,
                    ease: 'Sine.Out'
                }
            })

        });

        const button = this.add.image(0, 0, "menu_button").setScale(buttonScale);
        const text = this.add.text(0, 0, "Back", {
            fontSize: '44px',
            fontStyle: 'bold',
            fill: '#fff',
            align: 'center'
        })
        .setOrigin(0.5, 0.5);
        //text.setScale(Math.min(1, (buttonWidth - 40) / text.width), names.length);

        const container = this.add.container(this.SCREEN_WIDTH / 2, this.SCREEN_WIDTH + 100, [button, text]);
        container.setSize(button.displayWidth, button.displayHeight);
        button.setInteractive();
        // hover + click events
        button.on("pointerover", () => {
            this.add.tween({
                targets: button,
                scale: buttonScale + (buttonScale / 9),
                duration: 200,
                ease: 'Sine.InOut'
            });
            this.hoverSFX.play({
                loop: false,
                volume: BaseScene.masterVolume * 1.5,
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
            this.selectionSFX.play({
                loop: false,
                volume: BaseScene.sfxVolume * BaseScene.masterVolume * 1.5,
            });
            this.handleButtonClick("menu");
        });

        this.timeline.add({
            at: buttonStartTime + (names.length + 1) * timeBetweenTweens,
            tween: {
                targets: container,
                y: this.SCREEN_HEIGHT * .9,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        })

        // title tweens
        this.timeline.add({
            at: buttonStartTime + ((names.length + 2) * timeBetweenTweens),
            tween: {
                targets: title,
                y: 50,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        })
        this.timeline.add({
            at: buttonStartTime + ((names.length + 2) * timeBetweenTweens) + flyInDuration,
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

    handleButtonClick(key) {
        this.changeScene(key);
    }

}