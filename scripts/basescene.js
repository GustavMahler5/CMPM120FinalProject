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

    FADE_DURATION = 200;


    create() {

        this.cameras.main.setBackgroundColor("#272727");
        this.fade(false, this.FADE_DURATION);
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

    }



    expandToBorder(image) {

        image.setScale(Math.max(this.SCREEN_WIDTH / image.width, this.SCREEN_HEIGHT / image.height));

    }

}