console.log("Running load-midi.js");

const input_src = 'content/midi/jumpy/';
const output_src = 'content/output/';

const file_name = '200.mid';

var fs = require('fs')
var parseMidi = require('midi-file').parseMidi
var writeMidi = require('midi-file').writeMidi

// Read MIDI file into a buffer
var input = fs.readFileSync(input_src + file_name)

// Parse it into an intermediate representation
// This will take any array-like object.  It just needs to support .length, .slice, and the [] indexed element getter.
// Buffers do that, so do native JS arrays, typed arrays, etc.
var parsed = parseMidi(input)

console.log(
    '\n\n\n' +
    JSON.stringify(parsed) +
    '\n\n\n'
);

// Turn the intermediate representation back into raw bytes
var output = writeMidi(parsed)

// Note that the output is simply an array of byte values.  writeFileSync wants a buffer, so this will convert accordingly.
// Using native Javascript arrays makes the code portable to the browser or non-node environments
var outputBuffer = Buffer.from(output)

// Write to a new MIDI file.  it should match the original
fs.writeFileSync(output_src + 'copy_' + file_name, outputBuffer)