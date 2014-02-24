# vt-streamer

Pull down a vector tile, and stream individual GeoJSON features out of it. 

**You provide:**

- [TileJSON](https://github.com/mapbox/tilejson-spec) that indicates where to get the tile from
- Tile coordinates to grab, as an array of `[z, x, y]`

**You get:**

- A stream that runs through all the layers in the vector tile and emits individual GeoJSON features

## Example usage

```javascript
var vtStream = require('vt-streamer');
var fs = require('fs');
var tilejson = JSON.parse(fs.readFileSync('/path/to/tilejson.json'));
var coords = [ 1, 0, 1 ];

// Calling the `vtStream` function loads your data source
vtStream(JSON.parse(tilejson), function (err, streamTile) {
    // Any errors would be related to loading your TileJSON
    if (err) return console.log(err);

    // Callback gives you a function that you can use to make tile requests
    // The function returns a readable stream that emits GeoJSON features
    var geojson = streamTile(coords)
        // Error during parsing or from making the tile request...
        .on('error', function(err) { console.log(err); })

        // `tileLoaded` event is fired and provides the vectorTile object, its compressed size, and coords
        .on('tileLoaded', function(vtile, size, coords) {
            console.log('Loaded ' + size + ' bytes of vector tile goodness');
        })

        // `startLayer` and `finishLayer` events are emitted for each layer in the vector tile
        .on('startLayer', function(name) { console.log('--- Start ' + name + ' ---'); })
        .on('finishLayer', function(name) {console.log('--- Finish ' + name + ' ---'); })

        // `data` event will send a GeoJSON feature
        .on('data', function(feature) {
            console.log(feature.properties);
        });

    // Or if you want to stream a bunch of data...
    var multipleTiles = [[0,0,0],[1,0,0],[1,1,0],[1,0,1]];
    var moreGeoJson = streamTile(multipleTiles)
        .on('error', function(err) { console.log(err); })
        .on('tileLoaded', function(vtile, size, coords) {
            console.log('Data received for ' + coords.join('/'));
        })
        .on('data', function(feature) {
            console.log(feature.geometry.coordinates);
        })
});
```
