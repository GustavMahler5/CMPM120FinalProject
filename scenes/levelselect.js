class LevelSelect extends BaseScene {
    constructor() {
        super("levelselect");
    }

    preload() {
        super.preload();
        this.load.image("menu_button", "assets/images/menu/menu_button.png");
        this.load.image("lvl1img", "assets/images/menu/level1jacket.png");
        this.load.image("lvl2img", "assets/images/menu/level2jacket.png");
        this.load.image("lvl3img", "assets/images/menu/level3Jacket.png"); // Github is being annoying by keeping the J capital
        this.load.image("menu_background", "assets/images/menu/background.png");
        this.load.image("lights", "assets/images/menu/lights.png");
        this.load.image("abduct_alien", "assets/images/level2/angry_alien.png");
        this.load.image("marvelous", "assets/images/level3/marvelous.png");
        this.load.image("oops", "assets/images/level3/oops.png");
        this.load.image('fullscreen', "assets/images/menu/fullscreen.png");

        this.load.audio('menu', 'assets/audio/songs/menu.wav');
        this.load.audio('hover', 'assets/audio/SFX/menu/hoverSelection.mp3');
        this.load.audio('selection', 'assets/audio/SFX/menu/selection.mp3');
    }

    onEnter() {

        this.animating = false;
        this.cameras.main.setBackgroundColor(0xE0C6AD);
        this.sound.volume = BaseScene.masterVolume;

        this.hoverSFX = this.sound.add('hover');
        this.selectionSFX = this.sound.add('selection');

        let menuMusicPlaying = false;
        this.sound.getAllPlaying().forEach(sound => {
            if (sound.key != "menu") {
                sound.stop();
            }
            else {
                menuMusicPlaying = true;
            }
        });
        if (!menuMusicPlaying) {
            let menu_bgm = this.sound.add("menu", {
                volume:  BaseScene.musicVolume,
                loop: true
            });
            menu_bgm.play();
            BaseScene.currentMusic = menu_bgm;
        }


        this.add.image(0, 0, "menu_background")
            .setOrigin(0, 0)
            .setScale(0.44);


        const title = this.add.text(this.SCREEN_WIDTH * 0.5, -25, "Select Level",  {
                fontSize: '64px', 
                fill: '#fff',
                align: 'center'
        }).setOrigin(.5, .5);

        let levels = [
            { key: "level1", texture: "lvl1img", grade: BaseScene.level1BestScore },
            { key: "level2tutorial", texture: "lvl2img", grade: BaseScene.level2BestScore },
            { key: "level3tutorial", texture: "lvl3img", grade: BaseScene.level3BestScore }
        ];

        const scale = 0.055;
        const spacing = 245;
        const centerY = this.SCREEN_HEIGHT / 2;
        const startX = this.SCREEN_WIDTH / 2 - spacing - 20;
        const endY = centerY;

        const borderColor = 0xDD55FF;
        const borderThick = 8;
        const borderRadius = 10;

        levels.forEach((level, i, grade) => {
            const x = startX + i * spacing;

            const icon = this.add.image(0, 0, level.texture)
                .setInteractive()
                .setScale(scale);

            const w = icon.displayWidth;
            const h = icon.displayHeight;
            const half = borderThick / 2;

            let levelGrade;

            if (level.grade <= 0) {}
            else if (level.grade < this.CUTOFF_SCORE) {
                levelGrade = this.add.image (
                            icon.x,
                            icon.y - (icon.displayHeight * 0.5),
                            "oops")
                            .setOrigin(1, 1)
                            .setScale(0.07)
                            .setAngle(-45)
                            .setInteractive()
            }
            else {
                levelGrade = this.add.image (
                            icon.x,
                            icon.y - (icon.displayHeight * 0.5),
                            "marvelous")
                            .setOrigin(1, 1)
                            .setScale(0.07)
                            .setAngle(-45)
                            .setInteractive()
            }

            const border = this.add.graphics();
            const glowSteps = [
                { extra: 14, alpha: 0.06 },
                { extra: 10, alpha: 0.13 },
                { extra: 6,  alpha: 0.25 },
                { extra: 3,  alpha: 0.5  },
                { extra: 0,  alpha: 1.0  },
            ];
            for (const step of glowSteps) {
                const exp = step.extra / 2;
                border.lineStyle(borderThick + step.extra, borderColor, step.alpha);
                border.strokeRoundedRect(
                    -w / 2 - half - exp,
                    -h / 2 - half - exp,
                    w + borderThick + step.extra,
                    h + borderThick + step.extra,
                    borderRadius + exp
                );
            }

            let container = this.add.container(x, -200, [border, icon]);
            if (levelGrade) container.add(levelGrade);

            icon.on("pointerover", () => {
                this.add.tween({
                    targets: container,
                    scale: 1.1,
                    duration: 150,
                    ease: "Sine.InOut"
                });

                this.hoverSFX.play({
                    loop: false,
                    volume: BaseScene.sfxVolume * 1.5
                });
            });

            icon.on("pointerout", () => {
                this.add.tween({
                    targets: container,
                    scale: 1,
                    duration: 150,
                    ease: "Sine.InOut"
                });
            });

            icon.on("pointerdown", () => {
                icon.setTint(0xdddddd);
            });

            icon.on("pointerup", () => {
                if (this.animating) return;
                icon.clearTint();

                this.selectionSFX.play({
                    loop: false,
                    volume: BaseScene.sfxVolume * 1.5
                });

                this.animating = true;
                this.playAbductionAnimation(container, icon, x, endY, level.key);
            });

            this.add.tween({
                targets: container,
                y: endY,
                duration: 900,
                delay: i * 150,
                ease: "Sine.Out"
            });
        });

        this.setupBackButton();

        this.add.tween({
                targets: title,
                y: 100,
                duration: 1000,
                ease: "Sine.Out"
            });
    }

    handleButtonClick(key) {
        this.changeScene(key);
    }

    playAbductionAnimation(container, icon, containerX, containerY, levelKey) {
        const ufoScale = 4;
        const ufo = this.add.image(containerX, -80, 'abduct_alien')
            .setScale(ufoScale)
            .setDepth(20);

        const ufoTargetY = containerY - 90;

        this.tweens.add({
            targets: ufo,
            y: ufoTargetY,
            duration: 600,
            ease: 'Back.Out',
            onComplete: () => {
                const ufoBottomY = ufoTargetY + ufo.displayHeight / 2;
                const beamTopW = ufo.displayWidth * 0.55;
                const beamBotW = icon.displayWidth * 1.6;
                const beamBotY = containerY + 100;

                const beam = this.add.graphics().setDepth(18).setAlpha(0);
                const numSlices = 16;
                for (let s = 0; s < numSlices; s++) {
                    const t0 = s / numSlices;
                    const t1 = (s + 1) / numSlices;
                    const y0 = ufoBottomY + t0 * (beamBotY - ufoBottomY);
                    const y1 = ufoBottomY + t1 * (beamBotY - ufoBottomY);
                    const w0 = beamTopW + t0 * (beamBotW - beamTopW);
                    const w1 = beamTopW + t1 * (beamBotW - beamTopW);
                    const alpha = 0.65 * Math.pow(1 - t0, 1.5);
                    beam.fillStyle(0xFF55CC, alpha);
                    beam.fillPoints([
                        { x: containerX - w0 / 2, y: y0 },
                        { x: containerX + w0 / 2, y: y0 },
                        { x: containerX + w1 / 2, y: y1 },
                        { x: containerX - w1 / 2, y: y1 },
                    ], true);
                }

                this.tweens.add({
                    targets: beam,
                    alpha: { from: 0, to: 1 },
                    duration: 80,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        beam.setAlpha(1);
                        container.setVisible(false);

                        const abductIcon = this.add.image(containerX, containerY, icon.texture.key)
                            .setScale(icon.scaleX)
                            .setDepth(19);

                        this.tweens.add({
                            targets: abductIcon,
                            y: ufoTargetY + ufo.displayHeight * 0.1,
                            scale: 0,
                            angle: 360,
                            duration: 800,
                            ease: 'Quad.In',
                            onComplete: () => {
                                abductIcon.destroy();

                                this.tweens.add({
                                    targets: beam,
                                    alpha: 0,
                                    duration: 120,
                                    onComplete: () => beam.destroy()
                                });

                                const curve = new Phaser.Curves.CubicBezier(
                                    new Phaser.Math.Vector2(ufo.x, ufoTargetY),
                                    new Phaser.Math.Vector2(ufo.x + 160, ufoTargetY + 18),
                                    new Phaser.Math.Vector2(ufo.x + 480, ufoTargetY - 70),
                                    new Phaser.Math.Vector2(ufo.x + 860, -270)
                                );
                                const vec = new Phaser.Math.Vector2();
                                const follower = { t: 0 };

                                this.tweens.add({
                                    targets: ufo,
                                    scaleX: ufoScale * 0.35,
                                    scaleY: ufoScale * 0.35,
                                    duration: 580,
                                    ease: 'Sine.In'
                                });

                                this.tweens.add({
                                    targets: follower,
                                    t: 1,
                                    duration: 580,
                                    ease: t => 0.5 - 0.5 * Math.cos(Math.PI * Math.pow(t, 0.85)),
                                    onUpdate: () => {
                                        curve.getPoint(follower.t, vec);
                                        ufo.x = vec.x;
                                        ufo.y = vec.y;
                                    },
                                    onComplete: () => this.handleButtonClick(levelKey)
                                });
                            }
                        });
                    }
                });
            }
        });
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
                volume: BaseScene.sfxVolume * 1.5
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
                volume: BaseScene.sfxVolume * 1.5
            });

            this.handleButtonClick("menu");
        });
    }
}