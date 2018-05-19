// Initialize polyfill
var polyfill        = new WebVRPolyfill((function() {
    var config = {};
    var q = window.location.search.substring(1);
    if (q === '') {
      return config;
    }
    var params = q.split('&');
    var param, name, value;
    for (var i = 0; i < params.length; i++) {
      param = params[i].split('=');
      name = param[0];
      value = param[1];
      // All config values are either boolean or float
      config[name] = value === 'true' ? true :
                     value === 'false' ? false :
                     parseFloat(value);
    }
    return config;
})());
// Three.js renderer
var renderer        = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
// Effect
var effect          = new THREE.VREffect(renderer);
// Three.js scene
var scene           = new THREE.Scene();
// Three.js texture loader
var textureLoader   = new THREE.TextureLoader();
// Three.js camera object, initialized in ready
var camera;
// Three.js control object, initialized in ready
var controls;
// Rendering enter/exit UI
var vrButton;

var vrDisplay;

var sunLight;

$(document).ready(function () {
    // Three.js renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    // Create a three.js camera
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 20000);
    // Apply VR stereo rendering to renderer
    effect.setSize(window.innerWidth, window.innerHeight);
    // Initialize WebVR UI
    initWebVR();
    // Add skybox
    initSkybox();
    // Add light
    initLight();
});

// Window resize call back
function onResize() {
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}
$(window).resize(onResize);
$(window).bind('vrdisplaypresentchange', onResize);

function initSkybox() {
    var skyboxTextureFilenames = [
        'res/skybox/posX.jpg', 'res/skybox/negX.jpg',
        'res/skybox/posY.jpg', 'res/skybox/negY.jpg',
        'res/skybox/posZ.jpg', 'res/skybox/negZ.jpg'];
    var materialArray = [];
    for(var i = 0; i < 6; i++) {
        (function (i) {
            textureLoader.load(skyboxTextureFilenames[i], function(texture) {
                materialArray[i] = new THREE.MeshBasicMaterial({
                    map:    texture,
                    side:   THREE.BackSide
                })
            });
        }) (i);
    }
    var skyboxGeometry = new THREE.CubeGeometry(5000, 5000, 5000);
    var skybox = new THREE.Mesh(skyboxGeometry, materialArray);
    skybox.rotateX(Math.PI/2);
    scene.add(skybox);
}

function initLight() {
    // Add light
    sunLight = new THREE.PointLight(0xFFFFFF, 1.0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
}

function initWebVR() {
    // Controls initializaiton
    navigator.getVRDisplays().then(function(vrDisplays) {
        // If we have a native display, or a Cardboard VR Display, then use it
        if(vrDisplays.length) {
            vrDisplay = vrDisplays[0];
            // Apply VR headset positional data to camera
            controls = new THREE.VRControls(camera);
            controls.standing = true;
            // Kick off the render loop
            vrDisplay.requestAnimationFrame(animate);
        }
        // Otherwise we're on a desktop environment with no native
        // displays, thus provide the controls for a monoscopic view
        else {
            controls = new THREE.OrbitControls(camera);
            controls.target.set(0, 0, -1);
            requestAnimationFrame(animate);
        }
    });
    vrButton = new webvrui.EnterVRButton(renderer.domElement, {
        color:      'black',
        background: 'white',
        corners:    'square'
    });
    vrButton.on('exit', function() {
        camera.quaternion.set(0, 0, 0, 1);
        camera.position.set(0, controls.userHeight, 0);
    });
    vrButton.on('hide', function() {
        $('#ui').css('display', 'none');
    });
    vrButton.on('show', function() {
        $('#ui').css('display', 'inherit');
    });
    $('#vr-button').append(vrButton.domElement);
    $('#magic-window').click(function() {
        vrButton.requestEnterFullscreen();
    });
}

var lastRender = 0;
function animate(timestamp) {
    var delta = Math.min(timestamp - lastRender, 500);
    lastRender = timestamp;
    // Update VR headset position and apply to camera.
    controls.update();
    // Render the scene.
    effect.render(scene, camera);
    if (vrDisplay) {
        vrDisplay.requestAnimationFrame(animate);
    } else {
        requestAnimationFrame(animate);
    }
}
