var cameraTransform = new (function (){
    this.cameraDistance = minDistance;
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
        var min = minDistance;
        if(!VRDisplay) min = controls.minDistance;
        if(this.cameraDistance > min) {
            this.cameraDistance -= 0.5;
        }
    };
    this.goFarther = function() {
        var max = maxDistance;
        if(!VRDisplay) max = controls.maxDistance;
        if(this.cameraDistance < max) {
            this.cameraDistance += 0.5;
        }
    };
    this.increasePhi = function() {
        var offset = 0.01;
        if(this.cameraPhi < Math.PI/2 - offset) {
            this.cameraPhi += offset;
        }
    };
    this.decreasePhi = function() {
        var offset = 0.01;
        if(this.cameraPhi > -Math.PI/2 + offset) {
            this.cameraPhi -= offset;
        }
    };
    this.increaseTheta = function() {
        var offset = 0.01;
        this.cameraTheta += offset;
        if(this.cameraTheta > 2*Math.PI)    this.cameraTheta -= 2*Math.PI;
        if(this.cameraTheta < 0)            this.cameraTheta += 2*Math.PI;
    };
    this.decreaseTheta = function() {
        var offset = 0.01;
        this.cameraTheta -= offset;
        if(this.cameraTheta > 2*Math.PI)    this.cameraTheta -= 2*Math.PI;
        if(this.cameraTheta < 0)            this.cameraTheta += 2*Math.PI;
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
        800 * Math.cos((a-0.22) * 2 * Math.PI),
        0,
        800 * Math.sin((0.22 - a) * 2 * Math.PI)
    );
}

function updateMoonRotation() {
    var c = nowInYear() + nowInLunarMonth();
    moonObject.quaternion.set(0, 0, 0, 1);
    moonObject.rotateY((c - 0.72) * 2 * Math.PI);
}

function updateMoonLocation() {
    var c = nowInYear() + nowInLunarMonth();
    moonObject.position.set(
        385 * Math.cos((c - 0.22) * 2 * Math.PI),
        0,
        385 * Math.sin((0.22 - c) * 2 * Math.PI)
    );
}
