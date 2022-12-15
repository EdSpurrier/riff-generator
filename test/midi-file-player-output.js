console.log("Running midi-file-player-output.js");
const utils = require('../midi/utils/utils')
const files = require('../midi/utils/files')

const input_src = './content/midi/jumpy/';
const file_name = 'Groove Riff - Ocean Grove - Junkies.mid';


const fs = require('fs');

const settings_src = './content/settings/';
let config = JSON.parse(fs.readFileSync(settings_src + 'config.json'));
console.log('Config Loaded.');
console.log(config);


var easymidi = require('easymidi');

var output = new easymidi.Output('Riff Generator');


var MidiPlayer = require('midi-player-js');

// Initialize player and register event handler
var Player = new MidiPlayer.Player(function(event) {

});

Player.on('fileLoaded', function() {
    // Do something when file is loaded
    console.log('fileLoaded');

    utils.NoteOffAll(output);

    Player = utils.FixMidiEventNames(Player);
    Player = utils.SetTempo(config.tempo, Player);   

    Player.play();
});

Player.on('play', function() {
    console.log('Starting Playback', Player);
});

Player.on('playing', function(currentTick) {
    var currentBeat = Math.floor(Player.getCurrentTick()/Player.getDivision().division);

    if(Player.metaData.currentBeat < currentBeat) {
        Player.metaData.currentBeat = currentBeat;
        console.log(
            'playing', 
            currentBeat,
            "/",
            Player.metaData.totalBeats,
            "-",
            Player.metaData.timeSignature
        );

    }

});

Player.on('midiEvent', function(event) {
    // Do something when a MIDI event is fired.
    // (this is the same as passing a function to MidiPlayer.Player() when instantiating.



    if (event["sound"] == 1) {
        output.send(
            event["name"], {
            note: event["noteNumber"],
            velocity: event["velocity"],
            channel: event["channel"]
        });
        
        //console.log(event["tick"] + ":" + event["name"] + ":" + event["noteNumber"] + ":" + event["velocity"] + ":" + event["channel"]);

    } else {
        //console.log(event["tick"] + ":" + event["name"]);
    }
    
      
});




Player.on('endOfFile', function() {
    // Do something when end of the file has been reached.

    utils.NoteOffAll(output);

    console.log('endOfFile');


});




// Load a MIDI file
Player.loadFile(input_src + file_name);




