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
// The pose camera, stores the relative position
var poseCamera = new THREE.Object3D();
// Three.js control object, initialized in ready
var controls;
var minDistance = 15;
var maxDistance = 200;

// Rendering enter/exit UI
var vrButton;
var vrDisplay;

var sunLight;
var earthHUD;
var moonHUD;

$(document).ready(function () {
    // Three.js renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    // Create a three.js camera
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 20000);
    cameraTransform.init(camera);
    // Apply VR stereo rendering to renderer
    effect.setSize(window.innerWidth, window.innerHeight);
    // Initialize WebVR UI
    initWebVR();
    // Add skybox
    initSkybox();
    // Add light
    initLight();
    // Add objects
    initSceneObjects();
    // Add HUD
    earthHUD = new EarthHUD();
    moonHUD = new MoonHUD();
});

// Window resize call back
function onResize() {
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}
$(window).resize(onResize);
$(window).bind('vrdisplaypresentchange', onResize);

function initWebVR() {
    // Controls initializaiton
    navigator.getVRDisplays().then(function(vrDisplays) {
        // If we have a native display, or a Cardboard VR Display, then use it
        if(vrDisplays.length) {
            vrDisplay = vrDisplays[0];
            // Apply VR headset positional data to camera
            controls = new THREE.VRControls(poseCamera);
            controls.standing = true;
            // Kick off the render loop
            vrDisplay.requestAnimationFrame(animate);
        }
        // Otherwise we're on a desktop environment with no native
        // displays, thus provide the controls for a monoscopic view
        else {
            controls = new THREE.OrbitControls(camera);
            controls.minDistance = minDistance;
            controls.maxDistance = maxDistance;
            controls.target.set(0, 0, 0);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
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
        cameraTransform.init(camera);
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