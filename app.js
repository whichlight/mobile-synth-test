console.log('test');

var context;

try{
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  context = new AudioContext();
}
catch (err){
  alert('web audio not supported');
}

if (window.DeviceMotionEvent) {
    console.log("DeviceMotionEvent supported");
}

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
} else {
    document.getElementById("dmEvent").innerHTML = "Not supported."
}

if (window.DeviceOrientationEvent) {
  // Listen for the event and handle DeviceOrientationEvent object
  window.addEventListener('deviceorientation', devOrientHandler, false);
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

var accelControl;

oscillator = context.createOscillator(); // Create sound source
oscillator.type = 2; // Square wave
oscillator.frequency.value = 400
var filter = context.createBiquadFilter();


gainNode = context.createGainNode();
gainNode.gain.value = 0;
filter.type = 0;
filter.frequency.value = 440;

oscillator.connect(filter); // Connect sound to output
filter.connect(gainNode);
gainNode.connect(context.destination);
oscillator.active = false;


$fun = $("#fun");

var playSound =  function(e){
  e.preventDefault();
  console.log(e);

  if(!oscillator.active){
    oscillator.noteOn(0); // Play instantly
  }


  oscillator.active = true;
  gainNode.gain.value = 0.5;
  $fun.css("background-color","lime");
  return false;
}

var stopSound = function(e){
  e.preventDefault();
  gainNode.gain.value = 0;
  $fun.css("background-color","white");
  return false;
}


$fun.bind("mousedown", playSound);
$fun.bind("mouseup",stopSound);


$fun.bind("touchstart", playSound);
$fun.bind("touchend", stopSound);

function deviceMotionHandler(eventData) {
  var info, xyz = "[X, Y, Z]";

  // Grab the acceleration from the results
  var acceleration = eventData.acceleration;
  info = xyz.replace("X", acceleration.x);
  info = info.replace("Y", acceleration.y);
  info = info.replace("Z", acceleration.z);

  // Grab the acceleration including gravity from the results
  acceleration = eventData.accelerationIncludingGravity;
  info = xyz.replace("X", acceleration.x);
  info = info.replace("Y", acceleration.y);
  info = info.replace("Z", acceleration.z);

  // Grab the rotation rate from the results
  var rotation = eventData.rotationRate;
  info = xyz.replace("X", rotation.alpha);
  info = info.replace("Y", rotation.beta);
  info = info.replace("Z", rotation.gamma);

  // // Grab the refresh interval from the results
  info = eventData.interval;

  var accelControl = acceleration.x;
  oscillator.frequency.value = 200+ accelControl*50;

}

function devOrientHandler(eventData) {
    // gamma is the left-to-right tilt in degrees, where right is positive
    var tiltLR = eventData.gamma;

    // beta is the front-to-back tilt in degrees, where front is positive
    var tiltFB = eventData.beta;
    var filterval = map_range(tiltFB, -90, 90, 10000, 0);

    filter.frequency.value = filterval;


    // alpha is the compass direction the device is facing in degrees
    var dir = eventData.alpha;

    // call our orientation event handler
    deviceOrientationHandler(tiltLR, tiltFB, dir);
}


