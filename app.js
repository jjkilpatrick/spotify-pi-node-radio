var lame = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
// var uri = process.argv[2] || 'spotify:track:6tdp8sdXrXlPV6AZZN2PE8';
var uri = process.argv[2] || 'spotify:user:jjkilpatrick:playlist:3a62gxG7RUWIBboQP3RMWv';

var type = Spotify.uriType(uri);

// Spotify credentials...
var username = 'jjkilpatrick';
var password = 'j6206k03';

console.log(type);

// // https://github.com/voodootikigod/node-serialport
// var SerialPort = require("serialport").SerialPort
// var serialPort = new SerialPort("/dev/tty-usbserial1", {
//     baudrate: 9600
// });

if ('playlist' != type) {
    throw new Error('Must pass a "playlist" URI, got ' + JSON.stringify(type));
}

// serialPort.on("open", function() {
//     console.log('open');
//     serialPort.on('data', function(data) {
//         console.log('data received: ' + data);
//     });
//     serialPort.write("ls\n", function(err, results) {
//         console.log('err ' + err);
//         console.log('results ' + results);
//     });
// });

Spotify.login(username, password, function(err, spotify) {
    if (err) throw err;

    spotify.playlist(uri, function(err, playlist) {
        if (err) throw err;

        var tracks = [];

        playlist.contents.items.forEach(function(track) {
            tracks.push(track.uri);
        });

        // console.log(tracks.map(function(t) {
        //     return t;
        // }));

        function next() {
            // Get first track from tracks array
            var track = tracks.shift();
            if (!track) return spotify.disconnect();

            spotify.get(track, function(err, t) {
                if (err) throw err;
                console.log('Playing: %s - %s', t.artist[0].name, t.name)

                t.play()
                    .pipe(new lame.Decoder())
                    .pipe(new Speaker())
                    .on('finish', function() {
                        spotify.disconnect();
                    });
            });
        }
        next();
    });
});