class LevelSelect2 extends BaseScene {
    constructor() {
        super("levelselectprototype2");
    }

    preload() {
        this.load.image("menu_button_prototype", "../assets/images/menu/menu_button_prototype.png");
        this.load.image("lvl1img", "../assets/images/menu/lvl1icon.png");
        this.load.image("lvl2img", "../assets/images/menu/lvl2icon.png");
        this.load.image("lvl3img", "../assets/images/menu/lvl3icon.png");
        this.load.image("menu_background", "../assets/images/menu/background.png");
        this.load.image("lights", "../assets/images/menu/lights.png");

        this.load.audio('menu', '../assets/audio/songs/menu.wav');
        this.load.audio('hover', '../assets/audio/sfx/menu/hoverSelection.mp3');
        this.load.audio('selection', '../assets/audio/sfx/menu/selection.mp3');
    }

    onEnter() {
        this.cameras.main.setBackgroundColor(0xE0C6AD);

        this.hoverSFX = this.sound.add('hover');
        this.selectionSFX = this.sound.add('selection');

        let music = this.sound.add("menu", {
            volume: BaseScene.masterVolume,
            loop: true
        });
        music.play();


        this.add.image(0, 0, "menu_background")
            .setOrigin(0, 0)
            .setScale(0.44);

        const levels = [
            { key: "gameplayprototype2", texture: "lvl1img" },
            { key: "gameplayprototype4", texture: "lvl2img" },
            { key: "tutorial2", texture: "lvl3img" }
        ];

        const scale = 0.1;
        const spacing = 220; // horizontal spacing between icons
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
                    scale: scale * 1.2,
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
    }

    handleButtonClick(key) {
        this.changeScene(key);
    }
}