function init() {
    game = new Game();
    // Display maze

    wallColor = '#'+Math.random().toString(16).substr(-6);

    drawMaze();

    addVRClickListener(()=>{
        if(currentClickTarget)
            currentClickTarget.click();
    });
}

function drawMaze() {
    let sceneEl = document.querySelector('a-scene');

    for(let x = 0; x < mazeWidthX; x++) {
        for(let y = 0; y < mazeWidthY; y++) {
            let color = 'grey';
            if(game.maze.start.x == x && game.maze.start.y == y) 
                color = 'red';
            if(game.maze.end.y == y && game.maze.end.x == x)
                color = 'blue';
            
            let floorTile = document.createElement('a-entity');
            floorTile.setAttribute('floor', {'coordinates': {x, y}, color:color});
            sceneEl.appendChild(floorTile);

            let walls = game.maze.getCell(x, y).walls;
            if(walls.top) {
                let wall = document.createElement('a-entity');
                wall.setAttribute('wall', {'coordinates': {x, y}, 'direction':'top', color:wallColor});
                sceneEl.appendChild(wall);
            }

            if(walls.right) {
                let wall = document.createElement('a-entity');
                wall.setAttribute('wall', {'coordinates': {x, y}, 'direction':'right', color:wallColor});
                sceneEl.appendChild(wall);
            }
        }   
    }

    for(let x = 0; x < mazeWidthX; x++) {
        let wall = document.createElement('a-entity');
        wall.setAttribute('wall', {'coordinates': {x, y:mazeWidthY-1}, direction:'bottom', color:wallColor});
        sceneEl.appendChild(wall);
    }
    for(let y = 0; y < mazeWidthY; y++) {
        let wall = document.createElement('a-entity');
        wall.setAttribute('wall', {'coordinates': {x:0, y}, direction:'left', color:wallColor});
        sceneEl.appendChild(wall);
    }
    
    //Allow the floor tile data to propogate before updating the maze.
    setTimeout(function(){ updateMaze(game.currentLocation.x, game.currentLocation.y); }, 500);
}

function makeMove(x, y) {
    game.moveTo(x, y);
    updateMaze(x, y);

    if(game.isGameFinished()) {
        clearMaze();
        game = new Game();
        wallColor = '#'+Math.random().toString(16).substr(-6);

        drawMaze();
        //Allow the floor tile data to propogate before updating the maze.
        setTimeout(function(){ updateMaze(game.currentLocation.x, game.currentLocation.y); }, 500);
    }
}

function updateMaze(x, y) {
    let sceneEl = document.querySelector('a-scene');
    let floorTiles = sceneEl.querySelectorAll('[floor]');
    for (let i = 0; i < floorTiles.length; i++) {
        let tileX = floorTiles[i].getAttribute('coordinates').x;
        let tileY = floorTiles[i].getAttribute('coordinates').y;
        if(game.isMoveValid(tileX, tileY)) {
            floorTiles[i].setAttribute('clickable', true);
        } else {
            floorTiles[i].setAttribute('clickable', false);
        }
        floorTiles[i].setAttribute(
            'position', {x: (tileX-x)*floorTileSize, y: -2, z: (tileY-y)*floorTileSize});
    }

    var walls = sceneEl.querySelectorAll('[wall]');
    for (var i = 0; i < walls.length; i++) {
        walls[i].setAttribute(
            'position', {
                x: (walls[i].getAttribute('coordinates').x-x)*floorTileSize, 
                y: -2, z: (walls[i].getAttribute('coordinates').y-y)*floorTileSize});
    }
}

function clearMaze() {
    let sceneEl = document.querySelector('a-scene');
    let floorTiles = sceneEl.querySelectorAll('[floor]');
    for (let i = 0; i < floorTiles.length; i++) {
        floorTiles[i].parentNode.removeChild(floorTiles[i]);
    }
    var walls = sceneEl.querySelectorAll('[wall]');
    for (var i = 0; i < walls.length; i++) {
        walls[i].parentNode.removeChild(walls[i]);
    }
}

AFRAME.registerComponent('mainframe', {
    init: function () {  
       init();
    }
});

AFRAME.registerComponent('coordinates', {
    schema: {type:'vec2', default: {x: 0, y: 0}}
});

AFRAME.registerComponent('clickable', {
    schema: {type:'bool', default: false}
});

AFRAME.registerComponent('floor', {
    schema: {
        coordinates: {type:'vec2', default: {x: 0, y: 0}},
        color: {type: 'string', default: 'grey'}
    },

    init: function() {
        let el = this.el;

        el.setAttribute('coordinates', this.data.coordinates);

        let moveIndicator = document.createElement('a-entity');
            moveIndicator.setAttribute('class', 'moveIndicator');
            moveIndicator.setAttribute('material', {
            color: 'black'
        });
        moveIndicator.setAttribute('geometry', {
            primitive: 'ring',
            radiusInner: floorTileSize/4,
            radiusOuter: floorTileSize/4+0.2
        });
        moveIndicator.setAttribute('rotation', {x: -90, y: 0, z: 0});
        moveIndicator.setAttribute('position', {x: 0, y: 0.1, z: 0});
        moveIndicator.object3D.visible = false;

        let floorPlane = document.createElement('a-entity');
            floorPlane.setAttribute('class', 'floorPlane');
            floorPlane.setAttribute('material', {
            color: this.data.color
        });
        floorPlane.setAttribute('geometry', {
            primitive: 'plane',
            height: floorTileSize,
            width: floorTileSize
        });
        floorPlane.setAttribute('rotation', {x: -90, y: 0, z: 0});
        
        el.appendChild(moveIndicator);
        el.appendChild(floorPlane);
        
        el.addEventListener('mouseenter', function() {
            if(this.getAttribute('clickable')) {
                moveIndicator.object3D.visible = true;
                currentClickTarget = this;
            }
        });
        
        el.addEventListener('mouseleave', function() {
            moveIndicator.object3D.visible = false;
            if(currentClickTarget == this) {
                currentClickTarget = null;
            }
        });

        el.addEventListener('click', function() {
            if(this.getAttribute('clickable')) {
                let coords = this.getAttribute('coordinates');
                makeMove(coords.x, coords.y);
            }
        });
    }
});

AFRAME.registerComponent('wall', {
    schema: {
        coordinates: {type:'vec2', default: {x: 0, y: 0}},
        direction: {type:'string', default: 'top'},
        color: {type: 'color', default: 'grey'}
    },

    init: function() {
        let el = this.el;

        el.setAttribute('coordinates', this.data.coordinates);

        let wallbox = document.createElement('a-entity');
        wallbox.setAttribute('material', {
            color: this.data.color? this.data.color : 'grey'
        });
        wallbox.setAttribute('geometry', {
            primitive: 'box',
            height: 1,
            width: 1,
            depth: floorTileSize
        });
        wallbox.setAttribute('shadow', {'receive':false});
        if(this.data.direction == 'top' || this.data.direction == 'bottom' )
            wallbox.setAttribute('rotation', {x: 0, y: 90, z: 0});
        if(this.data.direction == 'top') 
            wallbox.setAttribute('position', {x: 0, y: 0.5, z: -floorTileSize/2});
        if(this.data.direction == 'bottom') 
            wallbox.setAttribute('position', {x: 0, y: 0.5, z: floorTileSize/2});
        if(this.data.direction == 'left') 
            wallbox.setAttribute('position', {x: -floorTileSize/2, y: 0.5, z: 0});
        if(this.data.direction == 'right') 
            wallbox.setAttribute('position', {x: floorTileSize/2, y: 0.5, z: 0});
        
        el.appendChild(wallbox);
    }
});

//https://github.com/toji/webvr.info/blob/master/samples/js/vr-samples-util.js
function addVRClickListener(clickCallback) {
    let lastButtonState = [];
    let presentingDisplay = null;

    // Set up a loop to check gamepad state while any VRDisplay is presenting.
    function onClickListenerFrame() {
        // Only reschedule the loop if a display is still presenting.
        if (presentingDisplay && presentingDisplay.isPresenting) {
            presentingDisplay.requestAnimationFrame(onClickListenerFrame);
        }
        
        let gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; ++i) {
            let gamepad = gamepads[i];
            // Ensure the gamepad is valid and has buttons.
            if (gamepad && gamepad.buttons.length) {
                let lastState = lastButtonState[i] || false;
                let newState = gamepad.buttons[0].pressed;
                // If the primary button state has changed from not pressed to pressed 
                // over the last frame then fire the callback.
                if (newState && !lastState) {
                    clickCallback(gamepad);
                }
                lastButtonState[i] = newState;
            }
        }
    }

    window.addEventListener('vrdisplaypresentchange', (event) => {
        // When using the polyfill, CustomEvents require event properties to
        // be attached to the `detail` property; native implementations
        // are able to attach `display` directly on the event.
        let display = event.detail ? event.detail.display : event.display;
        if (display.isPresenting) {
            let scheduleFrame = !presentingDisplay;
            presentingDisplay = display;
            if (scheduleFrame)
                onClickListenerFrame();
            } else if (presentingDisplay == display) {
                presentingDisplay = null;
            }
    });
}