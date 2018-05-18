// WebVR Polyfill Configurations
WebVRConfig = {
    BUFFER_SCALE: 0.5,
}

// Three.js renderer
var renderer
// Three.js scene
var scene;
// Three.js camera object
var camera;
// Three.js control object
var controls;
// Three.js texture loader
var textureLoader;
// Effect
var effect;
// Rendering enter/exit UI
var vrButton;

$(document).ready(function () {
    // Set Three.js renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    // Append the canvas element to the document
    document.body.appendChild(renderer.domElement);
    // Create a three.js scene
    scene = new THREE.Scene();
    // Create a three.js camera
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 10000);
    // Controls initializaiton
    controls = new THREE.VRControls(camera);
    controls.standing = true;
    camera.position.y = controls.userHeight;
    // Window resize call back
    function onResize() {
        effect.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    }
    $(window).resize(onResize);
    $(window).bind('vrdisplaypresentchange', onResize);
    // Apply VR stereo rendering to renderer
    effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);
    // Add skybox
    initSkybox();
    // Initialize WebVR UI
    initWebVRUI();
});

function initSkybox() {

}

function initWebVRUI() {
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

