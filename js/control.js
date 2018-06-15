window.addEventListener("gamepadconnected", function(e) {
    updateLoop();
    M.toast({html: 'Gamepad connected.'});
});

var fasterActioned = false;
var slowerActioned = false;
var toggleHUDActioned = false;
function updateLoop() {
    var gp = navigator.getGamepads()[0];
    if(gp.axes[0] > 0) {
        cameraTransform.increaseTheta();
    }
    if(gp.axes[0] < 0) {
        cameraTransform.decreaseTheta();
    }
    if(gp.buttons[5].pressed) {
        if(gp.axes[1] > 0) {
            cameraTransform.goFarther();
        }
        if(gp.axes[1] < 0) {
            cameraTransform.goNearer();
        }
    } else {
        if(gp.axes[1] > 0) {
            cameraTransform.decreasePhi();
        }
        if(gp.axes[1] < 0) {
            cameraTransform.increasePhi();
        }
    }
    if(gp.buttons[0]) {
        cameraTransform.goNearer();
    }
    if(gp.buttons[1]) {
        cameraTransform.goFarther();
    }
    if(gp.buttons[3].pressed) {
        if(!fasterActioned) fasterTime();
        fasterActioned = true;
    } else {
        fasterActioned = false;
    }
    if(gp.buttons[2].pressed) {
        if(!slowerActioned) slowerTime();
        slowerActioned = true;
    } else {
        slowerActioned = false;
    }
    if(gp.buttons[4].pressed) {
        if(!toggleHUDActioned) {
            if(earthHUD.visibility) earthHUD.hide(); else earthHUD.show();
            if(moonHUD.visibility) moonHUD.hide(); else moonHUD.show();
            toggleHUDActioned = true;
        } else {
            toggleHUDActioned = false;
        }
    }

    requestAnimationFrame(updateLoop);
}