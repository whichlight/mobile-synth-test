console.log('test');

var context;
try{
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
            context = new AudioContext();
}
catch (err){
        alert('web audio not supported');
            }

oscillator = context.createOscillator(); // Create sound source
oscillator.type = 1; // Square wave
oscillator.frequency.value = 100

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
