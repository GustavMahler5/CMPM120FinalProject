class LevelSelect extends BaseScene{
    constructor() {
        super("levelselectprototype");
    }
    
    preload() {
        this.load.image("menu_button_prototype", "../assets/images/menu_button_prototype.png");
        this.load.audio('hover', '../assets/audio/hoverSelection.mp3');
        this.load.audio('selection', '../assets/audio/selection.mp3');
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xE0C6AD);

        this.hoverSFX = this.sound.add('hover');
        this.selectionSFX = this.sound.add('selection');
        //bgm
        let music = this.sound.add("menu", {
            volume: BaseScene.masterVolume,
            loop: true
        });
        music.play();

        // add scene here to create button
        const scenes = [
            { key: "gameplayprototype",  label: "Prototype\n0" },
            { key: "gameplayprototype1", label: "Prototype\n1" },
            { key: "tutorial", label: "Prototype\n2" },
            { key: "gameplayprototype3", label: "Prototype\n3" },
            { key: "gameplayprototype4", label: "Prototype\n4" },
            { key: "gameplayprototype5", label: "Prototype\n5" },
            { key: "cinematicsmenuprototype1", label: "Back" }
        ]

        const buttonBackground = this.add.rectangle(-200, this.SCREEN_HEIGHT / 2, this.SCREEN_WIDTH / 4, this.SCREEN_HEIGHT, 0xC1B2A2);
        const startX = -200;                           // where buttons should start x wise
        const endX = buttonBackground.width / 2;       // where buttons should end up on the screen
        const timeBetweenTweens = 150;                 // all buttons fly in one after the other, after this duration
        const flyInDuration = 1000;                    // how long it should take buttons to fly in
        const buttonStartTime = 150;                  // how long the buttons should wait before starting their tweens

        const title = this.add.text(buttonBackground.width + ((this.SCREEN_WIDTH - buttonBackground.width) / 2), -25, "Level Select",  {
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#A3B2A4',
        }).setOrigin(.5, .5);
        let buttonHeight = this.SCREEN_HEIGHT / scenes.length;
        const buttonWidth = Phaser.Math.Clamp(buttonHeight * 2.375, 0, buttonBackground.width - 20); // 2.375 is the aspect ratio of the button image, clamp is used to make sure buttons don't get too big for the background
        buttonHeight = buttonWidth / 2.375;

        const buttonScale = buttonWidth / 76; // 76 is the original width of the button image, this calculates the scale needed to make the button the right width for the background
        const buttonSpacing = this.SCREEN_HEIGHT / scenes.length;
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

        scenes.forEach((scene, i) => {
            const x = startX;
            const y = (startY) + (buttonSpacing * i);

            const button = this.add.image(0, 0, "menu_button_prototype").setScale(buttonScale);
            const text = this.add.text(0, 0, scene.label, {
                fontSize: '32px', 
                fill: '#fff',
                align: 'center'
            })
            .setOrigin(0.5, 0.5);
            text.setScale(Math.min(1, (buttonWidth - 20) / text.width));


            // buttons + text are grouped into containers for easier use
            const container = this.add.container(x, y, [button, text]);
            container.scene = scene;
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
                // removed, as scenes haven't been made yet
                this.selectionSFX.play({
                    loop: false,
                    volume: BaseScene.masterVolume * 1.5,
                });
                this.handleButtonClick(container.scene.key);
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
            at: buttonStartTime + ((scenes.length + 1) * timeBetweenTweens),
            tween: {
                targets: title,
                y: 50,
                duration: flyInDuration,
                ease: 'Sine.Out'
            }
        })
        this.timeline.add({
            at: buttonStartTime + ((scenes.length + 1) * timeBetweenTweens) + flyInDuration,
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