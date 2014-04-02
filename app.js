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


var accelControl;

oscillator = context.createOscillator(); // Create sound source
oscillator.type = 2; // Square wave
oscillator.frequency.value = 400

gainNode = context.createGainNode();
gainNode.gain.value = 0;

oscillator.connect(gainNode); // Connect sound to output
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
