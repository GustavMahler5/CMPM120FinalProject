/*
Have all scenes extend the custom engine for this project: "Engine"
We will put all global variables and static functions into engine.js 
to maintain code readability and neatness.
*/

class SceneFlowPrototype extends Engine {

    constructor() {

        super("sceneflowprototype");

    }

    preload() {}

    create() {

        let placeholder = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "Scene flow prototyping goes here")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

    }

    update() {}
}