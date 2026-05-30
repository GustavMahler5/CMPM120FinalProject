# Scene Flow Prototype
--------------------------
The source code for many of the scenes are present in cinematicsprototype.js and gameplayprototype.js.  
However, the game is created in prototype.js and starts in sceneflowprototype.js.  
Is it organized? No. But does it work? Yes!

Scenes  
--------------------------
There are four distinct scenes in this prototype:  
- Main Menu  
- Gameplay  
- Settings  
- Credits  

Communication between scenes:
----------------------------
A global variable is present throughout the scenes.  
It keeps track of how many times the player has changes scenes.  
The player is able to see this variable in the console log

Reachability:
----------------------------
Players are able to traverse to any scene from any starting point via Back buttons

Transitions:
-----------------------------
Each scene transitions from one scene to the other through a coordinated fade  
to and from black.  



# Gameplay Prototype
--------------------------
The source code for gameplay logic is present in gameplayprototype3.js. 
gameplayprototype2.s and gameplayprototype.js are earlier iterations.  
Beatmaps and entities are entirely data driven found in score.json and assets.json

Audio 
--------------------------
There are two distinct audio types present in this prototype:
- Background music that plays throughout the level  
- Sound effects that play upon entity spawns to help the player with timing their inputs

Visual:
----------------------------
There are two types of distinct visuals present in this prototype:
- Image and sprite assets present everywhere in the level
- Phaser FX present in some sprites such as the UFO and the stars 

Motion:
----------------------------
Motion is featured throughout this prototype in the form of notes being tweened across the screen

Progression:
-----------------------------
The player is able to recieve a score (for now, in the final product it will be a grade)  
which provides feedback to the player on their improvements and will eventually unlock levels

Prefabs:
------------------------------
There are two prefabs that are present in this prototype:  
- All scenes extend a base scene that we use to keep each scene consistent and uniform
- We use JSON files to hold reusable asset definitions. The program reads the file and creates entities based on the data
