console.log("Running midi-player.js");


const input_src = './content/midi/jumpy/';
const file_name = 'Groove Riff - Ocean Grove - Junkies.mid';

var MidiPlayer = require('midi-player-js');

// Initialize player and register event handler
var Player = new MidiPlayer.Player(function(event) {
	console.log(event);
});

Player.on('fileLoaded', function() {
    // Do something when file is loaded
    console.log('fileLoaded');

    Player.play();
});

Player.on('playing', function(currentTick) {
    // Do something while player is playing
    // (this is repeatedly triggered within the play loop)
    console.log('playing', currentTick);
});

Player.on('midiEvent', function(event) {
    // Do something when a MIDI event is fired.
    // (this is the same as passing a function to MidiPlayer.Player() when instantiating.

    console.log('midiEvent', event);
});

Player.on('endOfFile', function() {
    // Do something when end of the file has been reached.

    console.log('endOfFile');
});




// Load a MIDI file
Player.loadFile(input_src + file_name);




