function init() {
    game = new Game();
    // Display maze

    var sceneEl = document.querySelector('a-scene');
    var floorTile = document.createElement('a-entity');
    floorTile.setAttribute('floor', {'position': {x: 0, y: -2, z: 0}, }, 'coordinates', {x: 0, y: 0});
    floorTile.setAttribute('clickable', true);
    sceneEl.appendChild(floorTile);

    addVRClickListener(()=>{
        console.log("all the click");
        if(currentClickTarget)
            currentClickTarget.click();
    });
}

AFRAME.registerComponent('mainframe', {
    init: function () {  
       console.log('initing');
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
        position: {type: 'vec3', default: {x: 0, y: 0, z: 0}},
        coordinates: {type:'vec2', default: {x: 0, y: 0}}
    },

    init: function() {
        var el = this.el;

        el.setAttribute('position', this.data.position);
        el.setAttribute('coordinates', this.data.coordinates);

        var moveIndicator = document.createElement('a-entity');
            moveIndicator.setAttribute('class', 'moveIndicator');
            moveIndicator.setAttribute('material', {
            color: 'black'
        });
        moveIndicator.setAttribute('geometry', {
            primitive: 'ring',
            radiusInner: floorsize/4,
            radiusOuter: floorsize/4+0.2
        });
        moveIndicator.setAttribute('rotation', {x: -90, y: 0, z: 0});
        moveIndicator.setAttribute('position', {x: 0, y: 0.1, z: 0});
        moveIndicator.object3D.visible = false;

        var floorPlane = document.createElement('a-entity');
            floorPlane.setAttribute('class', 'floorPlane');
            floorPlane.setAttribute('material', {
            color: 'grey'
        });
        floorPlane.setAttribute('geometry', {
            primitive: 'plane',
            height: floorsize,
            width: floorsize
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
                game.tileClicked(coords.x, coords.y);
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