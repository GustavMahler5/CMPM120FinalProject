Scene Flow Prototype
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
