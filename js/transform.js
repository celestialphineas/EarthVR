var cameraTransform = new (function (){
    this.cameraDistance = 18;
    // zOx
    this.cameraTheta    = Math.PI/2;
    this.zeroVector     = new THREE.Vector3(0, 0, 0);
    this.cameraPhi      = 0;
    this.init = function(camera) {
        // See control.js for definition of cameraDistance
        camera.position.set(this.cameraDistance, 0, 0);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    };
    this.goNearer = function() {
        if(this.cameraDistance > controls.minDistance) {
            this.cameraDistance -= 0.5;
        }
    };
    this.goFarther = function() {
        if(this.cameraDistance < controls.maxDistance) {
            this.cameraDistance += 0.5;
        }
    };
    this.increasePhi = function() {
        var offset = 0.02;
        if(this.cameraPhi < Math.PI/2 - offset) {
            this.cameraPhi += offset;
        }
    };
    this.decreasePhi = function() {
        var offset = 0.02;
        if(this.cameraPhi > -Math.PI/2 + offset) {
            this.cameraPhi -= offset;
        }
    };
    this.update = function() {
        camera.position.set(
            this.cameraDistance * Math.sin(this.cameraTheta) * Math.cos(this.cameraPhi),
            this.cameraDistance * Math.sin(this.cameraPhi),
            this.cameraDistance * Math.cos(this.cameraTheta) * Math.cos(this.cameraPhi),
        );
        camera.lookAt(this.zeroVector);
    };
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
        1000 * Math.cos((a-0.22) * 2 * Math.PI),
        0,
        1000 * Math.sin((0.22 - a) * 2 * Math.PI)
    );
}