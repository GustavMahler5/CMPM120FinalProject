"use strict";

let scenes = {

    level3: Level3,
    pause: PauseScene

};

const sceneKey = document.body.dataset.scene;
const startScene = prototypeScenes[sceneKey];

delete scenes[sceneKey];

let myScenes = [];
myScenes.push(startScene);

Object.entries(scenes).forEach(([key, value]) => {

    myScenes.push(value);

});

const config = {
    
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,
        height: 720,
    },

    backgroundColor: "#000000",

    /* 
    configured to display pixel art for cinematic prototype correctly
    when swapping to other styles, may need to be deleted
    */
    render: {
        pixelArt: true,
        antialias: false
    },

    scene: myScenes,
    title: "Our Game"
};

const game = new Phaser.Game(config);

console.log(`game.js loaded with start scene "${sceneKey}"`);