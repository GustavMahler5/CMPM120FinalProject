class LevelSelect extends BaseScene {
    constructor() {
        super("levelselect");
    }

    preload() {
        this.load.image("menu_button", "../assets/images/menu/menu_button.png");
        this.load.image("lvl1img", "../assets/images/menu/level2jacket.png");
        this.load.image("lvl2img", "../assets/images/menu/level2jacket.png");
        this.load.image("lvl3img", "../assets/images/menu/level3jacket.png");
        this.load.image("menu_background", "../assets/images/menu/background.png");
        this.load.image("lights", "../assets/images/menu/lights.png");

        this.load.audio('menu', '../assets/audio/songs/menu.wav');
        this.load.audio('hover', '../assets/audio/sfx/menu/hoverSelection.mp3');
        this.load.audio('selection', '../assets/audio/sfx/menu/selection.mp3');
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xE0C6AD);
        this.sound.volume = BaseScene.masterVolume;

        this.hoverSFX = this.sound.add('hover');
        this.selectionSFX = this.sound.add('selection');

        if (BaseScene.currentMusic) BaseScene.currentMusic.stop();
        let music = this.sound.add("menu", {
            volume: BaseScene.musicVolume,
            loop: true
        });
        music.play();
        BaseScene.currentMusic = music;


        this.add.image(0, 0, "menu_background")
            .setOrigin(0, 0)
            .setScale(0.44);

        const levels = [
            { key: "gameplayprototype4", texture: "lvl1img" },
            { key: "level2tutorial", texture: "lvl2img" },
            { key: "level3tutorial", texture: "lvl3img" }
        ];

        const scale = 0.1;
        const spacing = 250; // horizontal spacing between icons
        const centerY = this.SCREEN_HEIGHT / 2;
        const startX = this.SCREEN_WIDTH / 2 - spacing;
        const endY = centerY;

        levels.forEach((level, i) => {
            const x = startX + i * spacing;

            const icon = this.add.image(x, -200, level.texture)
                .setInteractive()
                .setScale(scale);

            icon.levelKey = level.key;

            icon.on("pointerover", () => {
                this.add.tween({
                    targets: icon,
                    scale: scale * 1.1,
                    duration: 150,
                    ease: "Sine.InOut"
                });

                this.hoverSFX.play({
                    loop: false,
                    volume: BaseScene.masterVolume * 1.5
                });
            });

            icon.on("pointerout", () => {
                this.add.tween({
                    targets: icon,
                    scale: scale,
                    duration: 150,
                    ease: "Sine.InOut"
                });
            });

            icon.on("pointerdown", () => {
                icon.setTint(0xdddddd);
            });

            icon.on("pointerup", () => {
                icon.clearTint();

                this.selectionSFX.play({
                    loop: false,
                    volume: BaseScene.masterVolume * 1.5
                });

                this.handleButtonClick(icon.levelKey);
            });

            this.add.tween({
                targets: icon,
                y: endY,
                duration: 900,
                delay: i * 150,
                ease: "Sine.Out"
            });
        });

        this.setupBackButton();
    }

    handleButtonClick(key) {
        this.changeScene(key);
    }

    setupBackButton() {
        const backButton = this.add.image(0, 0, "menu_button")
            .setInteractive().setScale(2.5);
        const buttonText = this.add.text(0, 0, "Back", {
            fontSize: '40px', 
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        const container = this.add.container(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT + 200, [backButton, buttonText]);

        this.add.tween({
            targets: container,
            y: this.SCREEN_HEIGHT * .8,
            duration: 900,
            delay: 3 * 150,
            ease: "Sine.Out"
        });

        backButton.on("pointerover", () => {
            this.add.tween({
                targets: container,
                scale: 1.1,
                duration: 150,
                ease: "Sine.InOut"
            });

            this.hoverSFX.play({
                loop: false,
                volume: BaseScene.masterVolume * 1.5
            });
        });

        backButton.on("pointerout", () => {
            this.add.tween({
                targets: container,
                scale: 1,
                duration: 150,
                ease: "Sine.InOut"
            });
        });

        backButton.on("pointerdown", () => {
            backButton.setTint(0xdddddd);
        });

        backButton.on("pointerup", () => {
            backButton.clearTint();

            this.selectionSFX.play({
                loop: false,
                volume: BaseScene.masterVolume * 1.5
            });

            this.handleButtonClick("menu");
        });
    }
}