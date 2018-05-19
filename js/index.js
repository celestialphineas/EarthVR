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
    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 20000);
    camera.position.set(16, 0, 0);
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
    sunLight.position.set(100, 0, 0);
    var textureLoader = new THREE.TextureLoader();

    var textureFlare0 = textureLoader.load('res/effects/flare.jpg');
    var textureFlare1 = textureLoader.load('res/effects/halo.png');

    var lensflare = new THREE.Lensflare();
    lensflare.addElement(new THREE.LensflareElement(textureFlare0, 500, 0, sunLight.color));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 100, 0.6));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 30, 0.7));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 240, 0.9));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 70, 1));
    sunLight.add(lensflare);
    scene.add(sunLight);
}

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
            controls.minDistance = 15;
            controls.maxDistance = 100;
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
        camera.position.set(16, 0, 0);
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
    if (vrDisplay) {
        vrDisplay.requestAnimationFrame(animate);
        // Update VR headset position and apply to camera.
        controls.update();
        var cameraPosition  = camera.position.clone();
        var cameraQuaterion = camera.quaternion.clone();
        var rotatedPosition = poseCamera.position.applyQuaternion(camera.quaternion);
        camera.position.add(rotatedPosition);
        camera.quaternion.multiply(poseCamera.quaternion);
        // Render the scene.
        effect.render(scene, camera);
        camera.position.copy(cameraPosition);
        camera.quaternion.copy(cameraQuaterion);
    } else {
        requestAnimationFrame(animate);
        // Update VR headset position and apply to camera.
        controls.update();
        effect.render(scene, camera);
    }
}

function initSceneObjects() {
    var radius = 6.3781;
    var objectGroup         = new THREE.Group();
    var bodySphereGeometry  = new THREE.SphereGeometry(radius, 64, 64);
    var bodySphereMaterial  = new THREE.MeshPhongMaterial({
        color:      new THREE.Color(0xffffff),
        specular:   new THREE.Color(0x243232),
        shininess:  25,
        bumpScale:  0.05,
    });
    bodySphereMaterial.map          = textureLoader.load('res/earth/diffuse.jpg');
    bodySphereMaterial.specularMap  = textureLoader.load('res/earth/spec.jpg');
    bodySphereMaterial.bumpMap      = textureLoader.load('res/earth/bump.jpg');
    objectGroup.add(new THREE.Mesh(bodySphereGeometry, bodySphereMaterial));
    var atmosphereGeometry = new THREE.SphereGeometry(radius + 0.02, 64, 64);
    var atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            {
                atmosphereColor:    {value: new THREE.Vector3(0.5, 0.7, 0.8)},
                sunsetColor:        {value: new THREE.Vector3(0.8, 0.7, 0.6)},
                atmosphereStrength: {value: 1.5},
                sunsetStrength:     {value: 1.0}
            }
        ]),
        vertexShader:   atmosphereVS,
        fragmentShader: atmosphereFS,
        transparent:    true,
        blending:       THREE.CustomBlending,
        blendEquation:  THREE.AddEquation,
        lights:         true
    });
    objectGroup.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
    var cloudGeometry = new THREE.SphereGeometry(radius + 0.04, 64, 64);
    var cloudMaterial = new THREE.MeshLambertMaterial({
        transparent:    true
    });
    cloudMaterial.map = textureLoader.load('res/earth/clouds.png');
    objectGroup.add(new THREE.Mesh(cloudGeometry, cloudMaterial));
    objectGroup.position.set(0, 0, 0);
    scene.add(objectGroup);
}