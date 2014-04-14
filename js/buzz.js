var context;
var $fun;
var synth;
var graphic;


/**
 *
 accel events and touch mapped to Synth and Graphic
 Synth plays notes
 Graphic does visuals
 *
 */

$(document).ready(function(){
  setup();
});

var checkFeatureSupport = function(){
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
  }
  catch (err){
    alert('web audio not supported');
  }

  if (!window.DeviceMotionEvent) {
    alert("DeviveMotionEvent not supported");
  }
}


var setup = function(){
  checkFeatureSupport();
  synth = new Synth();
  graphic = new Graphic();
  $fun = $("#fun");

  //add events
  $fun.bind("mousedown", touchActivate);
  $fun.bind("mouseup", touchDeactivate);
  $fun.bind("touchstart", touchActivate);
  $fun.bind("touchend", touchDeactivate);

  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', devOrientHandler, false);
  }

}


//touch and gesture mappings to synth and graphic
//
var touchActivate = function(e){
  synth.touchActivate(e);
  graphic.touchActivate(e);
}

var touchDeactivate = function(e){
  synth.touchDeactivate(e);
  graphic.touchDeactivate(e);
}

function deviceMotionHandler(eventData) {
  synth.accelHandler(eventData);
}

function devOrientHandler(eventData) {
  synth.orientHandler(eventData);
}



function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function Note(){
  this.filter;
  this.gain;
  this.osc;
  this.active = false;
  this.buildSynth();
}

Note.prototype.buildSynth = function(){
  this.osc = context.createOscillator(); // Create sound source
  this.osc.type = 3; // Square wave
  this.osc.frequency.value = 400;

  this.filter = context.createBiquadFilter();
  this.filter.type = 0;
  this.filter.frequency.value = 440;

  this.gain = context.createGainNode();
  this.gain.gain.value = 0;


  this.osc.connect(this.filter); // Connect sound to output
  this.filter.connect(this.gain);
  this.gain.connect(context.destination);
}

Note.prototype.setPitch = function(p){
  this.osc.frequency.value = p;
}

Note.prototype.setFilter = function(f){
  this.filter.frequency.value = f;
}

Note.prototype.setVolume= function(v){
  this.gain.gain.value = v;
}

Note.prototype.play = function(e){
  e.preventDefault();
  if(!this.active){
    this.osc.noteOn(0); // Play instantly
  }

  this.active = true;
  this.setVolume(0.5);
  return false;
}

Note.prototype.stop = function(e){
  e.preventDefault();
  this.setVolume(0);
  return false;
}


function Synth(){
  this.note = new Note();
}

Synth.prototype.touchActivate= function(e){
  this.note.play(e);
}

Synth.prototype.touchDeactivate= function(e){
  this.note.stop(e);
}


Synth.prototype.accelHandler = function(accel){
 var x = accel.accelerationIncludingGravity.x;
 this.note.setPitch(200 + x*50);
}

Synth.prototype.orientHandler = function(orient){
  var tiltFB = orient.beta;
  var filterval = map_range(tiltFB, -90, 90, 10000, 0);
  this.note.setFilter(filterval);
}


function Graphic(){

}

Graphic.prototype.touchActivate = function(e){
  $fun.css("background-color","lime");
}

Graphic.prototype.touchDeactivate = function(e){
  $fun.css("background-color","white");
}



