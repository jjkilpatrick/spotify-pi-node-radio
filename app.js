var lame = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var uri = process.argv[2] || 'spotify:user:jjkilpatrick:playlist:3a62gxG7RUWIBboQP3RMWv';
var type = Spotify.uriType(uri);
var config = require('./config');
var io = require('socket.io-client');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
var fs = require('fs');
var util = require('util');

username = config.spotify.username;
password = config.spotify.password;

checkDB();

function checkDB() {
        fs.exists('./spotify.sqlite3', function(exists){
		if(!exists){
			createDB();
		} else {
			util.debug('already exists, do nothing');
		}	
        });
}

function createDB() {
	console.log('DB created');
	db = new sqlite3.Database('spotify.sqlite3', createTable);
}

function createTable() {
	console.log('Table created');
	db.run("CREATE TABLE IF NOT EXISTS spotify (ID INTEGER PRIMARY KEY, Playlist VARCHAR(255), PlaylistID VARCHAR(255))");
}

function insertRows() {
	db = new sqlite3.Database('spotify.sqlite3');
	var stmt = db.prepare("INSERT INTO spotify VALUES (1,'asdawsda2','2adwsda4')");
	stmt.finalize();
	closeDb();
}

function closeDb() {
    console.log("closeDb");
    db.close();
}

if ('playlist' != type) {
    throw new Error('Must pass a "playlist" URI, got ' + JSON.stringify(type));
}

socket = io.connect(config.host + ':' + config.port);
console.log(config.host + ':' + config.port);

socket.on('connect', function() {
    console.log('Connected to Interface');

    socket.on('update', function(data) {
        console.log(data);
        insertRows();
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
