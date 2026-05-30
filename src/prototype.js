"use strict";

// Prototyping config. Add prototyping scenes for testing
// Use this for TESTING ONLY

let prototypeScenes = {

    cinematics: CinematicsPrototype,
    cinematicsMenu: CinematicsMenuPrototype,
    gameplay: GameplayPrototype,
    gameplay1: GameplayPrototype1,
    gameplay2: GameplayPrototype2,
    sceneFlow: SceneFlowPrototype,
    logo: LogoScene,
    settings: SettingsPrototype,
    credits: CreditsPrototype

};

const sceneKey = document.body.dataset.scene;
const StartScene = prototypeScenes[sceneKey];

delete prototypeScenes[sceneKey];

let myScenes = [];
myScenes.push(StartScene);

Object.entries(prototypeScenes).forEach(([key, value]) => {

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
    title: "Prototype"
};

const game = new Phaser.Game(config);

console.log(`prototype.js loaded with start scene "${sceneKey}"`);