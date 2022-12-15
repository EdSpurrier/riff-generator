exports.SetMetaData = (Player) => {

    var metaData = {
        tempo : Player.tracks["tempo"],
        currentBeat : -1
    }


    Player.tracks.forEach(function(track) {

        track["events"].forEach(function(event) {

            if (event["name"] == "Sequence/Track Name") {
                metaData.trackName = event["string"];
            } else if (event["timeSignature"]) {
                metaData.timeSignature = {
                    beats: event["timeSignature"].substring(0, event["timeSignature"].indexOf('/')),
                    measure: event["timeSignature"].substring(event["timeSignature"].indexOf('/')+1, event["timeSignature"].length),
                }
            }

            if(event["name"] == "End of Track") {
                metaData.lastTick = event["tick"];
            }
   
        });

        
    });



    metaData.totalBeats = Math.floor(metaData.lastTick / Player.getDivision().division);

    

    Player.metaData = metaData;

}



exports.FixMidiEventNames = (Player) => {

    // FIX event names for easymidi
    Player.tracks.forEach(function(track) {

        track["events"].forEach(function(event) {

            if (event["name"] == "Note on") {
                event["name"] = "noteon";
                event["sound"] = 1
            } else if (event["name"] == "Note off") {
                event["name"] = "noteoff";
                event["sound"] = 1
            } else {
                event["sound"] = 0
            }

            event["channel"] = 1

            Player.tracks["lastTick"] = event["lastTick"];
        });
        
    });

    this.SetMetaData(Player);



    return Player;
}


exports.SetTempo = (tempo, Player) => {

    // FIX event names for easymidi
    Player.tracks.forEach(function(track) {

        track["events"].forEach(function(event) {

            if (event["name"] == "Set Tempo") {
                event["data"] = tempo;
            }

        });
        
    });

    Player.tracks["tempo"] = tempo;

    return Player;

}




exports.NoteOffAll = (output) => {
    
    for (var i = 0; i <= 127; i++) {
        output.send(
            'noteoff', {
            note: i,
            velocity: 0,
            channel: 1
        });
    }
}