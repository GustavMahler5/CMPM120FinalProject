/*
Have all scenes extend the custom engine for this project: "Engine"
We will put all global variables and static functions into engine.js 
to maintain code readability and neatness.
*/

class GameplayPrototype extends Engine {

    constructor() {

        super("gameplayprototype");

    }

    preload() {}

    create() {

        let placeholder = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.5,
            "Gameplay prototyping goes here")
            .setStyle({ fontSize: `32px`, color: '#FFFFFF' })
            .setOrigin(0.5, 0.5);

    }

    update() {}
}