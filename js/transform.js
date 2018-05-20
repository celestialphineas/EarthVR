var cameraTransform = new (function (){
    this.init = function(camera) {
        camera.position.set(18, 0, 0);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
})();

function updateEarthRotation() {
    earthObject.quaternion.set(0, 0, 0, 1);
    earthObject.rotateX(-23.5/180*Math.PI);
    var a = nowInYear(), b = nowInDay();
    earthObject.rotateY((a + b - 0.72)*2*Math.PI);
}

function updateSunLocation() {
    var a = nowInYear();
    sunLight.position.set(
        100 * Math.cos((a-0.22) * 2 * Math.PI),
        0,
        100 * Math.sin((0.22 - a) * 2 * Math.PI)
    );
}