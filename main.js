function init() {
    game = new Game();
    // Display maze

    drawMaze();

    addVRClickListener(()=>{
        if(debug) console.log("Remote clicked, passing along event");
        if(currentClickTarget)
            currentClickTarget.click();
    });
}

function drawMaze() {
    let sceneEl = document.querySelector('a-scene');
    for(var x = 0; x < mazeWidthX; x++) {
        for(var y = 0; y < mazeWidthY; y++) {
            let floorTile = document.createElement('a-entity');
            floorTile.setAttribute('floor', {'coordinates': {x, y}});
            sceneEl.appendChild(floorTile);
        }   
    }
    
    //Allow the floor tile data to propogate before updating the maze.
    Promise.resolve().then(()=>{
        updateMaze(game.currentLocation.x, game.currentLocation.y);
    })
}

function makeMove(x, y) {
    let currentSpot = game.currentLocation;
    game.moveTo(x, y);
    updateMaze(x, y);
}

function updateMaze(x, y) {
    let sceneEl = document.querySelector('a-scene');
    var floorTiles = sceneEl.querySelectorAll('[floor]');
    for (var i = 0; i < floorTiles.length; i++) {
        let tileX = floorTiles[i].getAttribute('coordinates').x;
        let tileY = floorTiles[i].getAttribute('coordinates').y;
        if(game.isMoveValid(tileX, tileY)) {
            floorTiles[i].setAttribute('clickable', true);
        } else {
            floorTiles[i].setAttribute('clickable', false);
        }
        console.log({x: (tileX-x)*floorTileSize, y: -2, z: (tileY-y)*floorTileSize});
        floorTiles[i].setAttribute(
            'position', {x: (tileX-x)*floorTileSize, y: -2, z: (tileY-y)*floorTileSize});
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
        color: {type: 'color', default: 'grey'}
    },

    init: function() {
        var el = this.el;

        el.setAttribute('coordinates', this.data.coordinates);

        var moveIndicator = document.createElement('a-entity');
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

        var floorPlane = document.createElement('a-entity');
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
        var display = event.detail ? event.detail.display : event.display;
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