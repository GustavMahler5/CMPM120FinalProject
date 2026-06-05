"use strict";

// Prototyping config. Add prototyping scenes for testing
// Use this for TESTING ONLY

let prototypeScenes = {

    cinematics: CinematicsPrototype,
    cinematicsMenu1: CinematicsMenuPrototype1,
    cinematicsMenu: CinematicsMenuPrototype,
    gameplay: GameplayPrototype,
    gameplay1: GameplayPrototype1,
    gameplay2: GameplayPrototype2,
    gameplay3: GameplayPrototype3,
    gameplay4: GameplayPrototype4,
    gameplay5: GameplayPrototype5,
    evaluation: EvaluationScene,
    sceneFlow: SceneFlowPrototype,
    logo: LogoScene,
    settings: SettingsPrototype,
    credits: CreditsPrototype,
    levelSelect: LevelSelect,
    jaylalevelstart: Start

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