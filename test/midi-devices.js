console.log("Running midi-devices.js");

var easymidi = require('easymidi');

var inputs = easymidi.getInputs();
var outputs = easymidi.getOutputs();
console.log("inputs:", JSON.stringify(inputs));
console.log("outputs:", JSON.stringify(outputs));
