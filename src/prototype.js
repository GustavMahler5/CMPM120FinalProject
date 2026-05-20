"use strict";

// Prototyping config. Add prototyping scenes for testing
// Use this for TESTING ONLY

const prototypeScenes = {

    cinematics: CinematicsPrototype,
    gameplay: GameplayPrototype,
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

    scene: [StartScene],
    title: "Prototype"
};

const game = new Phaser.Game(config);

console.log("prototype.js loaded");