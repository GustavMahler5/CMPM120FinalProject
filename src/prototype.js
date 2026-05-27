"use strict";

// Prototyping config. Add prototyping scenes for testing
// Use this for TESTING ONLY

const prototypeScenes = {

    cinematics: CinematicsPrototype,
    cinematicsMenu: CinematicsMenuPrototype,
    gameplay: GameplayPrototype,
    gameplay2: GameplayPrototype2,
    sceneFlow: SceneFlowPrototype

};

const sceneKey = document.body.dataset.scene;
const StartScene = prototypeScenes[sceneKey];

const config = {
    
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,
        height: 720,
    },

    backgroundColor: "#000000",

    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 980
            }
        }
    },


    // configured to display pizel art for cinematic prototype correctly
    // when swapping to other styles, may need to be deleted
    render: {
        pixelArt: true,
        antialias: false
    },

    // CinematicsMenuPrototype probably shouldn't go here, but I have no idea how to load multiple scenes using this setup otherwise
    scene: [StartScene, CinematicsMenuPrototype, LogoScene, GameplayPrototype, SettingsPrototype, CreditsPrototype],
    title: "Prototype"
};

const game = new Phaser.Game(config);

console.log("prototype.js loaded");