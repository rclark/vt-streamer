#!/usr/bin/env node

var vtStream = require('../');
var path = require('path');
var fs = require('fs');

while (process.argv.shift() !== __filename) {}

if (process.argv.length < 1) return console.log('You must specify the path to valid TileJSON');
if (process.argv.length < 2) return console.log('You must specify a tile coordinate as [z, x, y]');

var tilejson = fs.readFileSync(path.resolve(process.argv[0]));
var tilecoord = JSON.parse(process.argv[1]);

vtStream(JSON.parse(tilejson), function (err, streamTile) {
    if (err) return console.log(err);

    var geojson = streamTile(tilecoord)
        .on('error', function(err) { console.log(err); })
        .on('tileLoaded', function(vtile, size) {
            console.log('Loaded ' + size + ' bytes of vector tile goodness');
        })
        .on('startLayer', function(name) { console.log('--- Start ' + name + ' ---'); })
        .on('finishLayer', function(name) {console.log('--- Finish ' + name + ' ---'); })
        .on('data', function(feature) {
            console.log(feature);
        });
});
