"use strict";

// ****************************************
// WHAT ASPECT RATIO ARE WE GOING TO USE?? 
// ****************************************

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

    scene: [Scene1],
    title: "CMPM 120 Final Project"

}

const prototype1 = {

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
 
    scene: [PrototypeScene],
    title: "Prototype1"

}

const game = new Phaser.Game(prototype1);

console.log("game.js loaded");