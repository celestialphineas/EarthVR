var currentTime = new Date();
var timeScale = 1;

// The function is called in the animate function
function updateTime(delta) {
    currentTime.setTime(
        currentTime.getTime() + timeScale * delta);
}

// This function returns a float between 0 and 1
// which indicates the proportion of the time passed
// since the first day of the year to the total time
// of a year
function nowInYear() {
    var firstDayOfTheYear = new Date(currentTime.getFullYear(), 0, 1);
    var dif = currentTime.getTime() - firstDayOfTheYear.getTime();
    return dif/31556926000;
}

function nowInDay() {
    var dif = (currentTime.getUTCHours()
        + currentTime.getUTCMinutes()/60
        + currentTime.getUTCSeconds()/3600)/24;
    return dif;
}

var newMoonEpoch = new Date('2018-01-17');
newMoonEpoch.setUTCHours(2);
newMoonEpoch.setUTCMinutes(17);
function nowInLunarMonth() {
    var c = currentTime.getTime();
    var o = newMoonEpoch.getTime();
    var t = 29.530588853 * 24 * 3600 * 1000;
    return ((c - o) - (Math.floor((c - o)/t) * t))/t;
}

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