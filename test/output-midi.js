console.log("Running output-midi.js");

var easymidi = require('easymidi');

var output = new easymidi.Output('Riff Generator');
output.send('noteon', {
  note: 64,
  velocity: 127,
  channel: 3
});

setTimeout(() => {
    output.send('noteoff', {
        note: 64,
        velocity: 127,
        channel: 3
    });
}, 1000)
