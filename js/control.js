function fasterTime() {
    if(timeScale < 1000000) {
        timeScale *= 10;
    }
}

function slowerTime() {
    if(timeScale > 0.1) {
        timeScale /= 10;
    }
}
