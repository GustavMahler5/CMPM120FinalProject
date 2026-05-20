"use strict";

// Default config. Try not to use this for testing
// Use this for the FINAL PRODUCT
const config = {

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,    // Change SCREEN_* upon editing aspect ratio
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

    scene: [Scene1],
    title: "CMPM 120 Final Project"

}

// Switch to prototype1 to test prototyped scenes
const game = new Phaser.Game(config);

console.log("game.js loaded");