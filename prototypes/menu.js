class Menu extends BaseScene {
    
    constructor() {
        super({ key: "menu" });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.image("menu_button", "../assets/images/menu_button.png");
        this.load.image("background", "../assets/images/title_bg.png");
        this.load.audio("menu", "../assets/audio/menu.wav");
        this.load.audio("button_sfx", "../assets/audio/enemySpawn.wav");
    }

    onEnter() {
        let menu_bgm = this.sound.add("menu", {
            volume: BaseScene.masterVolume,
            loop: true
        });
        menu_bgm.play();

        let button_sfx = this.sound.add("button_sfx", {
            volume: BaseScene.masterVolume,
        });

        this.background = this.add.image(540, 340, "background");

        const title = this.add.text(400, 100, "Game Name",  {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#A3B2A4',
        });

        const buttonLabels = ["Start", "Levels", "Settings", "Credits", "Exit"];  
        const buttonStart = 500

        const handleButtonClick = (label) => {
            // not fully implemented yet, so button clicks will be disabled until then
            switch(label) {
                case "Start":    
                    this.changeScene("gameplayprototype2");
                    break;
                
                case "Levels":
                    this.changeScene("levelselectprototype");
                    break;
    
                case "Settings":
                    this.scene.switch("settings");
                    break;
    
                case "Credits":  
                    this.changeScene("creditsprototype");
                    break;
    
                case "Exit":
                    this.changeScene("LogoScene");
                    break;
            }
        }

        buttonLabels.forEach((label, i) => {
            const button = this.add.image(0, 0, "menu_button")
            const text = this.add.text(0, 0, label, {
                fontSize: '32px', 
                fill: '#fff',
                align: 'center'
            })
            .setOrigin(0.5, 0.5);
            text.setScale(Math.min(1, (button.width - 20) / text.width));

            button.setInteractive()

            const container = this.add.container((this.SCREEN_WIDTH / 2) + (this.SCREEN_WIDTH / 300), (this.SCREEN_HEIGHT + 100), [button, text])
            container.setSize(button.displayWidth, button.displayHeight).setScale((this.SCREEN_HEIGHT / 400));

            // hover + click events
            button.on("pointerover", () => {
                this.sound.play("button_sfx");
                this.add.tween({
                    targets: container,
                    scale: this.SCREEN_HEIGHT / 300,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            button.on("pointerout",  () => {
                this.add.tween({
                    targets: container,
                    scale: this.SCREEN_HEIGHT / 400,
                    duration: 200,
                    ease: 'Sine.InOut'
                });
            });
            button.on("pointerdown", () => {
                button.setTint(0xdddddd);
                handleButtonClick(label);
            });
            button.on("pointerup", () => {
                button.clearTint();
                this.handleButtonClick(label);
            });        

            this.tweens.add({
                targets: container,
                y: this.SCREEN_HEIGHT / 3 + i * this.SCREEN_HEIGHT / 8,
                delay: i * 600,
                duration: 3000,
                ease: 'linear'
            })
        });

        // fx
        //this.cameras.main.shake(10000000, .001, true);

        this.tweens.add({
            targets: this.background

        })
    }
}

class Settings extends CinematicsMenuPrototype1 {
    
    constructor() {
        super({ key: "settings"});
    }

    preload() {

    }

    onEnter() {        
        this.add.graphics();
        
        this.fillStyle("0xf542dd");
        this.fillRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

        const title = this.add.text(400, 100, "Game Name",  {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#A3B2A4',
        });

        // this.scene.resume("menu"); this.scene.stop() on exit
    }

}
