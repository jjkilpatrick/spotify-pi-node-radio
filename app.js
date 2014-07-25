var lame = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var uri = process.argv[2] || 'spotify:user:jjkilpatrick:playlist:3a62gxG7RUWIBboQP3RMWv';
var type = Spotify.uriType(uri);
var config = require('./config');
var io = require('socket.io-client');
var fs = require('fs');
var util = require('util');
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600,
  databits: 8,
  parity: 'none',
  stopbits: 1,
});

serialPort.on("open", function () {
  serialPort.on('data', function(data) {
	tag = data.toString();
	tag.slice(0, 8);
	console.log(tag);
	if (tag === '4400E6A56E69') {
		console.log('matched');
	}
  });
});

username = config.spotify.username;
password = config.spotify.password;

socket = io.connect(config.host + ':' + config.port);
console.log(config.host + ':' + config.port);

socket.on('connect', function() {
    console.log('Connected to Interface');

    socket.on('update', function(data) {
        console.log(data);
    });
});

Spotify.login(username, password, function(err, spotify) {
    if (err) throw err;

    spotify.playlist(uri, function(err, playlist) {
        if (err) throw err;

        var tracks = [];

        playlist.contents.items.forEach(function(track) {
            tracks.push(track.uri);
        });

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
                      //spotify.disconnect();
                    });
            });
        }
        next();
    });
});
