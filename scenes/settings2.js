class SettingsScene2 extends BaseScene {
    constructor() {
        super({ key: "settings2" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button", "../assets/images/menu/menu_button.png");
        this.load.audio("button_sfx", "../assets/audio/SFX/menu/selection.mp3");
        this.load.audio("button_hover", "../assets/audio/SFX/menu/hoverSelection.mp3");
    }

    onEnter() {
        this.sound.volume = BaseScene.masterVolume;

        this.add.text(this.SCREEN_WIDTH / 2, 60, "Settings", {
            fontSize: "64px",
            fontStyle: "bold",
            fill: "#A3B2A4",
            align: 'center'
        }).setOrigin(0.5);

        const settings = [
            { label: "Master Volume", key: "masterVolume", type: "slider" },
            { label: "Music Volume",  key: "musicVolume",  type: "slider" },
            { label: "SFX Volume",    key: "sfxVolume",    type: "slider" },
        ];

        const startY = 180;
        const spacing = 100;

        settings.forEach((setting, index) => {
            const y = startY + index * spacing;
            this.add.text(150, y, setting.label, {
                fontSize: "24px",
                fill: "#fff",
            });
            this.createSlider(y, setting);
        });

        this.createBackButton();
    }

    createSlider(y, setting) {
        const sliderWidth = 300;
        const sliderHeight = 10;
        const x = this.SCREEN_WIDTH / 2 + 100;

        const bar = this.add.graphics();
        bar.fillStyle(0x444444);
        bar.fillRect(x, y - sliderHeight / 2, sliderWidth, sliderHeight);

        const valueText = this.add.text(
            x + sliderWidth + 20,
            y,
            (BaseScene[setting.key] * 100).toFixed(0) + "%",
            { fontSize: "20px", fill: "#fff" }
        ).setOrigin(0, 0.5);

        const handle = this.add.circle(x + BaseScene[setting.key] * sliderWidth, 
            y, 12, 0xf542dd);
            handle.setInteractive({ draggable: true });

            this.input.on('drag', (pointer, gameObject) => {
                if (gameObject !== handle) return;
            
            const newX = Math.max(x, Math.min(x + sliderWidth, pointer.x));
            const value = (newX - x) / sliderWidth;

            handle.x = newX;
            BaseScene[setting.key] = value;
            valueText.setText((value * 100).toFixed(0) + "%");

            if (setting.key === "masterVolume") {
                this.sound.volume = value;
            }
        });

                this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject !== handle) return;
            localStorage.setItem(setting.key, BaseScene[setting.key]);
            this.sound.play("button_sfx", { volume: BaseScene.sfxVolume * BaseScene.masterVolume });
        });

        handle.on('pointerover', () => {
            this.sound.play("button_hover", { volume: BaseScene.masterVolume });
            handle.setScale(1.3);
        });

        handle.on('pointerout', () => {
            handle.setScale(1);
        });
    }

        createToggle(y, setting) {
        const x = this.SCREEN_WIDTH / 2 + 100;
        const toggleWidth = 60;
        const toggleHeight = 30;

        const bg = this.add.graphics();
        const bgColor = BaseScene[setting.key] ? 0x00ff00 : 0xff0000;
        bg.fillStyle(bgColor);
        bg.fillRect(x, y - toggleHeight / 2, toggleWidth, toggleHeight);

        const text = this.add.text(
            x + toggleWidth / 2, y,
            BaseScene[setting.key] ? "ON" : "OFF",
            { fontSize: '16px', fill: '#fff', align: 'center' }
        ).setOrigin(0.5);

                const interactive = this.add.zone(x, y - toggleHeight / 2, toggleWidth, toggleHeight);
        interactive.setInteractive();

        interactive.on('pointerover', () => {
            this.sound.play("button_hover", { volume: BaseScene.masterVolume });
            interactive.setScale(1.2);
        });

        interactive.on('pointerout', () => {
            interactive.setScale(1);
        });

        interactive.on('pointerdown', () => {
            this.sound.play("button_sfx", { volume: BaseScene.masterVolume });
            BaseScene[setting.key] = !BaseScene[setting.key];
            localStorage.setItem(setting.key, BaseScene[setting.key]);

                    bg.clear();
            bg.fillStyle(BaseScene[setting.key] ? 0x00ff00 : 0xff0000);
            bg.fillRect(x, y - toggleHeight / 2, toggleWidth, toggleHeight);
            text.setText(BaseScene[setting.key] ? "ON" : "OFF");
        });
    }

    createBackButton() {
        const button = this.add.image(150, this.SCREEN_HEIGHT - 80, "menu_button");
        const text = this.add.text(150, this.SCREEN_HEIGHT - 80, "Back", {
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

            button.setInteractive();

        button.on('pointerover', () => {
            this.sound.play("button_hover", { volume: BaseScene.masterVolume });
            button.setScale(1.2);
        });

        button.on('pointerout', () => {
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            this.sound.play("button_sfx", { volume: BaseScene.masterVolume });
            this.changeScene("menu");
        });
    }    
}