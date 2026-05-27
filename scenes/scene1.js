/*
Have all scenes extend the custom engine for this project: "BaseScene"
We will put all global variables and static functions into basescene.js 
to maintain code readability and neatness.
*/

class Scene1 extends BaseScene {

    constructor() {

        super("scene1");

    }

    preload() {}

    create() {

        let placeholder = this.add.text(
            this.SCREEN_WIDTH * 0.5, 
            this.SCREEN_HEIGHT * 0.5, 
            "Game goes here")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

    }

    update() {}

}
