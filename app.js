var lame = require('lame')
var gpio = require('pi-gpio');;
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var uri = process.argv[2] || 'spotify:user:jjkilpatrick:playlist:3a62gxG7RUWIBboQP3RMWv';
var type = Spotify.uriType(uri);
var config = require('./config');

username = config.spotify.username;
password = config.spotify.password;

if ('playlist' != type) {
    throw new Error('Must pass a "playlist" URI, got ' + JSON.stringify(type));
}

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
                        spotify.disconnect();
                    });
            });
        }
        next();
    });
});
pi@ r