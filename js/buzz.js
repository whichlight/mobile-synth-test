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
  graphic.accelHandler(eventData);
}

function devOrientHandler(eventData) {
  synth.orientHandler(eventData);
  graphic.orientHandler(eventData);
}



function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function Note(){
  this.filter;
  this.gain;
  this.osc;
  this.played = false;
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
  if(!this.played){
    this.osc.noteOn(0); // Play instantly
  }

  this.played = true;
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
 this.note.setPitch(200 + x*100);
}

Synth.prototype.orientHandler = function(orient){
  var tiltFB = orient.beta;
  var filterval = map_range(tiltFB, -90, 90, 10000, 0);
  this.note.setFilter(filterval);
}


function Graphic(){
  this.activated = false;;
  this.background_color="purple";
}

Graphic.prototype.touchActivate = function(e){
  this.activated = true;
  $fun.css("background-color", "lime");
  $fun.css("background-color", this.background_color);
}

Graphic.prototype.touchDeactivate = function(e){
  this.activated = false;
  $fun.css("background-color","white");
}

Graphic.prototype.accelHandler = function(accel){
 var x = accel.accelerationIncludingGravity.x;
 var h = x/60.0;
 var c  = HSVtoRGB(h,1,1);
 this.background_color = "rgb("+c.r+","+c.g+","+c.b+")" ;
 if(this.activated){
   $fun.css("background-color", this.background_color);
 }
}

Graphic.prototype.orientHandler = function(orient){
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}


