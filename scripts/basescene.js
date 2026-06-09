/* 
Use this class to add global variables and functions 
that will be used across all scenes

Have scenes that extend BaseScene implement onEnter() in replacement of create()
*/

class BaseScene extends Phaser.Scene {

    /*
    Do not change these values without first 
    editing the aspect ratios in game.js
    */
    SCREEN_WIDTH = 1080;
    SCREEN_HEIGHT = 720;

    FADE_DURATION = 500;

    MAXIMUM_SCORE = 1000;
    CUTOFF_SCORE = 750;

    static justAGlobalVariable = 0;

    static level1BestScore = parseInt(localStorage.getItem('level1BestScore')) || 0;
    static level2BestScore = parseInt(localStorage.getItem('level2BestScore')) || 0;
    static level3BestScore = parseInt(localStorage.getItem('level3BestScore')) || 0;
    static masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 0.5;
    static sfxVolume = parseFloat(localStorage.getItem('sfxVolume')) || 0.5;
    static musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 0.5;
    static backgroundMusic = localStorage.getItem('backgroundMusic') !== 'false';
    static currentMusic = null;
    static pausedLevel = null;

    preload() {
//        this.load.setBaseURL('/CMPM120FinalProject/');
    }

    create() {

        this.cameras.main.setBackgroundColor("#272727");
        this.fade(false, this.FADE_DURATION);
        this.fullscreen = this.add.image(this.SCREEN_WIDTH - 20, this.SCREEN_HEIGHT - 20, 'fullscreen')
        .setOrigin(1, 1)
        .setScale(0.05)
        .setAlpha(0.5)
        .setDepth(1000)
        .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.scale.isFullscreen ? this.scale.stopFullscreen() : this.scale.startFullscreen();
            });

        this.onEnter();

    }



    fade(fadeOut) {

        if (fadeOut) {

            this.cameras.main.fadeOut(this.FADE_DURATION);

        }

        else {

            this.cameras.main.fadeIn(this.FADE_DURATION);
            
        }

    }



    changeScene(scene) {

        this.fade(true, this.FADE_DURATION);

        this.time.delayedCall(this.FADE_DURATION, () => {

            this.scene.start(scene);

        });

        console.log(`Don't mind me, I'm just a global variable. You have changed scenes ${BaseScene.justAGlobalVariable++} time(s)`);

    }



    expandToBorder(image) {

        image.setScale(Math.max(this.SCREEN_WIDTH / image.width, this.SCREEN_HEIGHT / image.height));

    }

}