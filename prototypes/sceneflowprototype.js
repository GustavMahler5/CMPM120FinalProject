/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class SceneFlowPrototype extends BaseScene {

    constructor() {

        super("sceneflowprototype");

    }

    preload() {

        this.load.image('fullscreen', "../assets/images/menu/fullscreen.png");
        
    }

    onEnter() {

        this.changeScene("LogoScene");

    }

    update() {}
}