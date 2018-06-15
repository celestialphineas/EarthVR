var EarthHUD = function() {
    var width = 8192, height = 2048;
    this.maxTransparency = 0.9;
    this.minTransparency = 0;
    this.transparency = this.maxTransparency;
    this.visibility = true;
    var canvas      = this.canvas   = document.createElement('canvas');
    var context     = this.context  = this.canvas.getContext('2d');
    var texture     = this.texture  = new THREE.Texture(canvas);
    var material    = this.material = new THREE.MeshBasicMaterial({map:texture});
    material.transparent = true;
    canvas.width    = width;
    canvas.height   = height;
    var geometry    = this.geometry = new THREE.PlaneGeometry(20, 5);
    var plane       = this.plane    = new THREE.Mesh(geometry, material);
    plane.position.set(0, 8, 0);
    scene.add(plane);
    this.update = function () {
        if(this.visibility && this.transparency < this.maxTransparency) {
            this.transparency += 0.02;
        } else if(!this.visibility && this.transparency > this.minTransparency) {
            this.transparency -= 0.02;
        }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'rgba(255, 255, 255,' + this.transparency + ')';
        this.context.font = '800px sans-serif';
        this.context.textAlign = 'left';
        this.context.textBaseline = 'hanging';
        this.context.fillText('Earth', 0, 0);
        this.context.font = '330px sans-serif';
        this.context.fillText(currentTime.toLocaleString('en-US'), 0, 900);
        this.context.fillText('Time scale: ' + timeScale + 'x', 0, 1300);
        this.texture.needsUpdate = true;
        // Rotation
        var angle = Math.atan2(camera.position.x, camera.position.z);
        this.plane.quaternion.set(0, 0, 0, 1);
        this.plane.rotateY(angle);
    }
    this.show = function () { this.visibility = true; }
    this.hide = function () { this.visibility = false; }
};

var MoonHUD = function() {
    var width = 8192, height = 2048;
    var maxTransparency = this.maxTransparency  = 0.9;
    var minTransparency = this.minTransparency  = 0;
    var transparency    = this.transparency     = this.maxTransparency;
    var visibility      = this.visibility       = true;
    var canvas      = this.canvas   = document.createElement('canvas');
    var context     = this.context  = this.canvas.getContext('2d');
    var texture     = this.texture  = new THREE.Texture(canvas);
    var material    = this.material = new THREE.MeshBasicMaterial({map:texture});
    material.transparent = true;
    canvas.width    = width;
    canvas.height   = height;
    var geometry    = this.geometry = new THREE.PlaneGeometry(160, 40);
    var plane       = this.plane    = new THREE.Mesh(geometry, material);
    plane.position.set(0, 8, 0);
    scene.add(plane);
    this.update = function () {
        if(visibility && transparency < maxTransparency) {
            transparency += 0.02;
        } else if(!visibility && transparency > minTransparency) {
            transparency -= 0.02;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgba(255, 255, 255,' + transparency + ')';
        context.font = '800px sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'hanging';
        context.fillText('Moon', width/2 + 500, 0);
        context.font = '320px sans-serif';
        var moonAge = (nowInLunarMonth() * 29.530588853).toFixed(1);
        context.fillText('Moon age: ' + moonAge + ' days', width/2 + 500, 900);
        context.fillText(this.getPhase(), width/2 + 500, 1300);
        texture.needsUpdate = true;
        // Location
        var c = nowInYear() + nowInLunarMonth();
        plane.position.set(
            385 * Math.cos((c - 0.22) * 2 * Math.PI),
            0,
            385 * Math.sin((0.22 - c) * 2 * Math.PI)
        );
        // Rotation
        var angle = Math.atan2(camera.position.x, camera.position.z);
        plane.quaternion.set(0, 0, 0, 1);
        plane.rotateY(angle);
    }
    this.getPhase = function() {
        var c = nowInLunarMonth();
        var padding = 0.02;
        if(c  < 0.00 + padding || c  > 1.00 - padding) return 'New moon';
        if(c >= 0.00 + padding && c <= 0.25 - padding) return 'Waxing crescent';
        if(c  > 0.25 - padding && c  < 0.25 + padding) return 'First quater';
        if(c >= 0.25 + padding && c <= 0.50 - padding) return 'Waxing gibbous';
        if(c  > 0.50 - padding && c  < 0.50 + padding) return 'Full moon';
        if(c >= 0.50 + padding && c <= 0.75 - padding) return 'Waning gibbous';
        if(c  > 0.75 - padding && c  < 0.75 + padding) return 'Third quater';
        else return 'Waning crescent';
    }
    this.show = function () { this.visibility = true; }
    this.hide = function () { this.visibility = false; }
};