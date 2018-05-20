window.addEventListener("gamepadconnected", function(e) {
    updateLoop();
});

var fasterActioned = false;
var slowerActioned = false;
function updateLoop() {
    var gp = navigator.getGamepads()[0];
    if(gp.axes[0] > 0) {
        cameraTransform.increaseTheta();
    }
    if(gp.axes[0] < 0) {
        cameraTransform.decreaseTheta();
    }
    if(gp.axes[1] > 0) {
        cameraTransform.decreasePhi();
    }
    if(gp.axes[1] < 0) {
        cameraTransform.increasePhi();
    }
    if(gp.buttons[0].pressed) {
        cameraTransform.goNearer();
    }
    if(gp.buttons[1].pressed) {
        cameraTransform.goFarther();
    }
    if(gp.buttons[3].pressed) {
        if(!fasterActioned) fasterTime();
        fasterActioned = true;
    } else {
        fasterActioned = false;
    }
    if(gp.buttons[2].pressed || gp.buttons[4].pressed) {
        if(!slowerActioned) slowerTime();
        slowerActioned = true;
    } else {
        slowerActioned = false;
    }

    requestAnimationFrame(updateLoop);
}