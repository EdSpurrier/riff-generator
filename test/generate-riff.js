console.log("Running generate-riff.js");
const utils = require('../midi/utils/utils')
const files = require('../midi/utils/files')


const fs = require('fs');

var writeMidi = require('midi-file').writeMidi

const settings_src = './content/settings/';
let config = JSON.parse(fs.readFileSync(settings_src + 'config.json'));
console.log('Config Loaded.');



var MidiPlayer = require('midi-player-js');

// Initialize player and register event handler
var Player = new MidiPlayer.Player(function(event) {

});


let generatorData = {
    meta : {
        totalRiffLength     : 0,
        totalNoteLength     : 0,
        totalSpaceLength    : 0
    },
    song : {
        notePossibility     : 0,
        spacePossibility    : 0
    },
    notes : new Array(),
    spaces : new Array()
}


/*

    note structure
    note: {
        note : note         // number
        possibility : 40    //  40%
        lengths : new Array()
    }


    length : {
        quaterLength: 0.5,  //  how much of a quater note is this
        possibility: 20     //  20%
    }

    spaces structure
    spaces: {
        possibility : 40    //  40%
        lengths : new Array()
    }


*/

const GatherNoteData = (Player) => {



    let allNotes = new Array();

    Player.tracks.forEach(function(track) {
        track["events"].forEach(function(event) {

            if (event["name"] == "noteon") {
                allNotes.push(event["noteNumber"]);
            }

        });
    });
    

    let gatheredNotes = new Array();
    
    let addedNotes = new Array();

    //console.log(Player.getDivision().division);


    allNotes.forEach(function(note) {
        if (!addedNotes.includes(note)) {


            // Get Lengths
            let gatheredNoteLengths = new Array();
            let allNoteLengths = new Array();
            let addedLengths = new Array();
            
            Player.tracks.forEach(function(track) {
                track["events"].forEach(function(event) {

                    if (event["name"] == "noteoff" && event["noteNumber"] == note) {
                        //console.log(event["delta"], Player.getDivision().division, event["delta"]/(Player.getDivision().division));
                        allNoteLengths.push(event["delta"]/(Player.getDivision().division));
                        
                        /* (Player.getDivision().division * 4)/event["delta"] QUARTER NOTE TYPE  */
                    }
        
                });
            });

            

            allNoteLengths.forEach(function(noteLength) {
                if (!addedLengths.includes(noteLength)) {

                    let newLength = {
                        quaterLength : noteLength,
                        possibility : ((Number.parseFloat(allNoteLengths.filter(x => x === noteLength).length) / Number.parseFloat(allNoteLengths.length))),
                    }

                    gatheredNoteLengths.push(newLength);

                    addedLengths.push(noteLength);
                };
            });

            
            let newNote = {
                note : note,
                possibility : ((Number.parseFloat(allNotes.filter(x => x === note).length) / Number.parseFloat(allNotes.length))),
                lengths : gatheredNoteLengths
            }

            if(newNote.lengths.length > 0) {
                gatheredNotes.push(newNote);
            }
            

            addedNotes.push(note);
        }     
    });

    //console.log(JSON.stringify(gatheredNotes));

    return gatheredNotes;
}


const GatherSpaceData = (Player) => {

    let gatheredSpaces = new Array(); 

    let allSpaces = new Array();

    let lastSpaceStart = 0;

    Player.tracks.forEach(function(track) {
        track["events"].forEach(function(event) {

            

            if (event["name"] == "noteon" || event["name"] == "End of Track") {

                if (lastSpaceStart < event["tick"]) {

                    let space = (event["tick"] - lastSpaceStart)/(Player.getDivision().division)

                    allSpaces.push(space);

                    lastSpaceStart = event["tick"];
                }
                
            } else if (event["name"] == "noteoff") {
                lastSpaceStart = event["tick"];
            }

        });
    });
    
    let addSpaces = new Array();

    allSpaces.forEach(function(space) {
        if (!addSpaces.includes(space)) {

            let newSpace = {
                length : space,
                possibility : ((Number.parseFloat(allSpaces.filter(x => x === space).length) / Number.parseFloat(allSpaces.length))),
            }

            gatheredSpaces.push(newSpace);
            addSpaces.push(space);
        }

    });

    return gatheredSpaces;
}


const GatherGeneratorMeta = (Player) => {

    let meta = {
        totalRiffLength     : Player.metaData.lastTick,
        totalNoteLength     : 0,
        totalSpaceLength    : 0,
    }

    Player.tracks.forEach(function(track) {

        track["events"].forEach(function(event) {

            if (event["name"] == "noteoff") {
                meta.totalNoteLength += event["delta"];
            };

        });

    });

    meta.totalSpaceLength = meta.totalRiffLength - meta.totalNoteLength;

    return meta
}



const GatherGeneratorData = (Player) => {

    generatorData.notes = GatherNoteData(Player);
    //console.log(generatorData.notes);

    generatorData.spaces = GatherSpaceData(Player);
    //console.log(generatorData.spaces);


    generatorData.meta = GatherGeneratorMeta(Player);
    //console.log(generatorData.meta);


    generatorData.song.notePossibility = generatorData.meta.totalNoteLength / generatorData.meta.totalRiffLength;
    generatorData.song.spacePossibility = generatorData.meta.totalSpaceLength / generatorData.meta.totalRiffLength;

    //console.log(generatorData.song);
}

/*
Example structure to write midi
{
    "header": {
        "format": 0,
        "numTracks": 1,
        "ticksPerBeat": 480
    },
    "tracks": [
        [
            {
                "deltaTime": 0,
                "meta": true,
                "type": "trackName",
                "text": "Guitar Heavy B"
            },
            {
                "deltaTime": 0,
                "meta": true,
                "type": "setTempo",
                "microsecondsPerBeat": 545454
            },
            {
                "deltaTime": 0,
                "meta": true,
                "type": "timeSignature",
                "numerator": 4,
                "denominator": 4,
                "metronome": 24,
                "thirtyseconds": 8
            },
            {
                "deltaTime": 0,
                "channel": 0,
                "type": "noteOn",
                "noteNumber": 48,
                "velocity": 100
            },
            {
                "deltaTime": 960,
                "channel": 0,
                "type": "noteOff",
                "noteNumber": 48,
                "velocity": 64
            },
            {
                "deltaTime": 960,
                "meta": true,
                "type": "endOfTrack"
            }
        ]
    ]
}
*/

const GenerateRiff = () => {
    let riff = {
        "header": {
            "format": 0,
            "numTracks": 1,
            "ticksPerBeat": config.ticksPerBeat
        },
        "tracks": [
            new Array()
        ]
    }

    riff.tracks[0].push(
        {
            "deltaTime": 0,
            "meta": true,
            "type": "trackName",
            "text": "Guitar"
        }
    );

    riff.tracks[0].push(
        {
            "deltaTime": 0,
            "meta": true,
            "type": "setTempo",
            "microsecondsPerBeat": Math.floor(60000000 / config.tempo)
        }
    );

    riff.tracks[0].push(
        {
            "deltaTime": 0,
            "meta": true,
            "type": "timeSignature",
            "numerator": config.generate.timeSignature.beats,
            "denominator": config.generate.timeSignature.measure,
            "metronome": 24,
            "thirtyseconds": 8
        }
    );


    let ticksLeft = config.ticksPerBeat * (config.generate.timeSignature.beats * config.generate.bars);

    //console.log(generatorData.song);

    //console.log(generatorData.notes);
    //console.log(generatorData.spaces);

    let silence = 0;

    while (ticksLeft > 0) {
        let chance = Math.random();

    //console.log("chance:", chance);



        if(chance <= generatorData.song.notePossibility) {
        //console.log("Playing Note!");

        //console.log('deltaTime', silence);

            

            let base = 0;
            let chosen = null;



            generatorData.notes.forEach(function(note) {

                let max = base + note.possibility;

                //console.log((base <= chance && chance <= max), base, max, chance);

                if (chosen != null) {
                    //console.log('skipping...');
                } else if (base <= chance && chance <= max) {
                    chosen = note;
                };
    
                base += max;
            });

            if (chosen == null) {
            //console.log("Chosen Was NULL!!");
                chosen = generatorData.notes[generatorData.notes.length-1]
            }

        //console.log("Chosen.lengths:", chosen.lengths);



            let noteLength = 0;
            base = 0;
            chosen.lengths.forEach(function(length) {

                let max = base + length.possibility;

                if (noteLength != 0) {
                    //console.log('skipping...');
                } else if (base <= chance && chance <= max) {
                    noteLength = length.quaterLength;
                };
    
                base += max;
            });

            if (noteLength == 0) {
                //console.log("noteLength Was 0!!");

                noteLength = chosen.lengths[chosen.lengths.length-1].quaterLength;
            }


            noteLength = Math.floor(noteLength * config.ticksPerBeat);

            //console.log((ticksLeft < noteLength), ticksLeft, noteLength);

            if (ticksLeft < noteLength) {
            //console.log("correcting noteLength from:", noteLength);

                noteLength = ticksLeft;
            }

        //console.log("noteLength:", noteLength);
            

            riff.tracks[0].push(
                {
                    "deltaTime": silence,
                    "channel": 0,
                    "type": "noteOn",
                    "noteNumber": chosen.note,
                    "velocity": 100
                }
            );


            riff.tracks[0].push(
                {
                    "deltaTime": noteLength,
                    "channel": 0,
                    "type": "noteOff",
                    "noteNumber": chosen.note,
                    "velocity": 100
                }
            );



            ticksLeft -= noteLength;

            silence = 0;
        } else {
        //console.log("Silence");

            let base = 0;
            let chosen = null;

            generatorData.spaces.forEach(function(space) {

                let max = base + space.possibility;

                if (chosen != null) {
                    //console.log('skipping...');
                } else if (base <= chance && chance <= max) {
                    chosen = space;
                };
    
                base += max;
            });

            if (chosen == null) {
                //console.log("Chosen Was NULL!!");
                chosen = generatorData.spaces[generatorData.spaces.length-1]
            }

        //console.log("Chosen:", chosen);
            silence = Math.floor(chosen.length * config.ticksPerBeat);

            ticksLeft -= silence;
        }


        
    }

//console.log(ticksLeft, (ticksLeft < 0)?ticksLeft * -1:0);


    riff.tracks[0].push(
        {
            "deltaTime": (ticksLeft < 0)?ticksLeft * -1:0,
            "meta": true,
            "type": "endOfTrack"
        }
    );

    return riff;

    //console.log(JSON.stringify(riff));
}

const SaveRiff = (riff) => {

    // Turn the intermediate representation back into raw bytes
    var output = writeMidi(riff)

    // Note that the output is simply an array of byte values.  writeFileSync wants a buffer, so this will convert accordingly.
    // Using native Javascript arrays makes the code portable to the browser or non-node environments
    var outputBuffer = Buffer.from(output)

    var outputFolder = config.output_folder + "/" + config.output_name + "/";

    if (!fs.existsSync(outputFolder)){
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    let filename = outputFolder + config.output_name + "-" + Date.now() + '.mid';

    // Write to a new MIDI file.  it should match the original
    fs.writeFileSync(filename, outputBuffer)

    console.log("Saved Generated Riff:", filename);
}


Player.on('fileLoaded', function() {
    // Do something when file is loaded
    console.log('fileLoaded');


    Player = utils.FixMidiEventNames(Player);
    Player = utils.SetTempo(config.tempo, Player);   



    GatherGeneratorData(Player);

    for(var i = 0; i < config.generate.count; i++) {
        let riff = GenerateRiff();
        SaveRiff(riff);
    }

});



// Load a MIDI file
Player.loadFile(config.input_folder + config.input_file);
