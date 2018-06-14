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
    var skybox = new THREE.Mesh(skyboxGeometry, materialArray);;
    skybox.rotateY(0.2);
    skybox.rotateZ(0.9);
    scene.add(skybox);
}

function initLight() {
    // Add light
    sunLight = new THREE.PointLight(0xFFFFFF, 1.0);
    var textureLoader = new THREE.TextureLoader();

    var textureFlare0 = textureLoader.load('res/effects/flare.jpg');
    var textureFlare1 = textureLoader.load('res/effects/halo.png');

    var lensflare = new THREE.Lensflare();
    lensflare.addElement(new THREE.LensflareElement(textureFlare0, 400, 0, sunLight.color));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 100, 0.6));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 30, 0.7));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 240, 0.9));
    lensflare.addElement(new THREE.LensflareElement(textureFlare1, 70, 1));
    sunLight.add(lensflare);
    scene.add(sunLight);
}

var lastRender = 0;
function animate(timestamp) {
    var delta = Math.min(timestamp - lastRender, 500);
    lastRender = timestamp;
    // See time.js for definition
    updateTime(delta);
    updateEarthRotation();
    updateSunLocation();
    updateMoonRotation();
    updateMoonLocation();
    if(vrDisplay)
        cameraTransform.update();
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

var earthObject;
var moonObject;
function initSceneObjects() {
    var earthRadius = 6.3781;
        earthObject         = new THREE.Group();
    var bodySphereGeometry  = new THREE.SphereGeometry(earthRadius, 64, 64);
    var bodySphereMaterial  = new THREE.MeshPhongMaterial({
        color:      new THREE.Color(0xffffff),
        specular:   new THREE.Color(0x353330),//#FDF9E0
        shininess:  25,
        bumpScale:  0.05,
    });
    bodySphereMaterial.map          = textureLoader.load('res/earth/diffuse.jpg');
    bodySphereMaterial.specularMap  = textureLoader.load('res/earth/spec.jpg');
    bodySphereMaterial.bumpMap      = textureLoader.load('res/earth/bump.jpg');
    earthObject.add(new THREE.Mesh(bodySphereGeometry, bodySphereMaterial));
    var nightSphereGeometry  = new THREE.SphereGeometry(earthRadius + 0.02, 64, 64);
    var nightSphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            sunPosition:  {value: sunLight.position},
            nightTexture: {value: textureLoader.load('res/earth/night.png')}
        },
        vertexShader: generalVS,
        fragmentShader: nightFS,
        transparent: true,
        // blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation
    });
    earthObject.add(new THREE.Mesh(nightSphereGeometry, nightSphereMaterial));
    var cloudGeometry = new THREE.SphereGeometry(earthRadius + 0.04, 64, 64);
    var cloudMaterial = new THREE.MeshLambertMaterial({
        transparent:    true
    });
    cloudMaterial.map = textureLoader.load('res/earth/clouds.png');
    earthObject.add(new THREE.Mesh(cloudGeometry, cloudMaterial));
    var atmosphereGeometry = new THREE.SphereGeometry(earthRadius + 0.08, 64, 64);
    var atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            {
                atmosphereColor:    {value: new THREE.Vector3(0.5, 0.7, 0.9)},
                sunsetColor:        {value: new THREE.Vector3(0.8, 0.7, 0.6)},
                atmosphereStrength: {value: 1.5},
                sunsetStrength:     {value: 1.0}
            }
        ]),
        vertexShader:   atmosphereVS,
        fragmentShader: atmosphereFS,
        transparent:    true,
        // blending:       THREE.CustomBlending,
        blendEquation:  THREE.AddEquation,
        lights:         true
    });
    earthObject.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
    earthObject.position.set(0, 0, 0);
    scene.add(earthObject);

    var moonRadius   = 1.7371 * 3.5;
    var moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
    var moonMaterial = new THREE.MeshPhongMaterial({
        color:      new THREE.Color(0xffffff),
        specular:   new THREE.Color(0x000000),
        bumpScale:  0.04,
    });
    moonMaterial.map          = textureLoader.load('res/moon/diffuse.jpg');
    moonMaterial.bumpMap      = textureLoader.load('res/moon/bump.jpg');
    moonObject = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonObject);
}