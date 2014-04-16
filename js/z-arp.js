var context;
var $fun;
var synth;
var graphic;
var noteVal = 400;
var t = new Date();

var q_notes = [55.000, 61.735, 65.406, 73.416, 82.407, 87.307, 97.999, 110.000, 123.471, 130.813, 146.832, 164.814, 174.614, 195.998, 220.000,
246.942, 261.626, 293.665, 329.628, 349.228, 391.995, 440.000, 493.883, 523.251, 587.330, 659.255, 698.456, 783.991, 880.000, 987.767, 1046.502, 1174.659, 1318.510, 1396.913, 1567.982, 1760.000, 1975.533, 2093.005, 2349.318, 2637.020, 2793.826, 3135.963, 3520.000]

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
  e.preventDefault();
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
  this.volume = 0.5;
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
  this.volume = v;
}

Note.prototype.play = function(){
  if(!this.played){
    this.osc.noteOn(0); // Play instantly
  }

  this.played = true;
  this.setVolume(this.volume);
  return false;
}

Note.prototype.stop = function(){
  this.gain.gain.value = 0;
  return false;
}


function Synth(){
  this.note = new Note();
}

Synth.prototype.touchActivate= function(e){
  this.note.play();
}

Synth.prototype.touchDeactivate= function(e){
  this.note.stop();
}


Synth.prototype.accelHandler = function(accel){
  var z = Math.abs(accel.acceleration.x) ;
  var change =map_range(z, 0, 20, 200,1000);
  var qchange = quantize(change, [220, 440, 880, 880*2])
  $("#logval").html(Math.round(qchange));
  //quantize pitch
  this.note.setPitch(qchange);
}

var quantize = function(f, notes){
  var qnote = 0;
  notes.some(function(n){
      qnote = n;
      return f < n;
  });
  return qnote;
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
 var x = accel.acceleration.x;
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


