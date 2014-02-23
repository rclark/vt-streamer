var vtDump = require('vt-dumper');
var geojsonStream = require('geojson-stream');

var VtStreamer = function(tileJson, callback) {
    vtDump(tileJson, function(err, getTile) {
        if (err) return callback(err);

        callback(null, streamTile);

        function streamTile(coords) {
            if (coords.length === 3 && 
                !isNaN(coords[0]) &&
                !isNaN(coords[1]) &&
                !isNaN(coords[2])) coords = [ coords ];

            var geojson = geojsonStream.parse();

            function closeStream() { geojson.end(); }

            function getOneTile(tileIndex) {
                if (tileIndex === coords.length) return closeStream();

                var tileCoords = coords[tileIndex];

                getTile(tileCoords, function (err, data, vtile, size) {
                    if (err) return geojson.emit('error', err);

                    function writeLayer(layerIndex) {
                        if (layerIndex === data.length) return getOneTile(tileIndex + 1);

                        var layer = data[layerIndex];
                        geojson.emit('startLayer', layer.name);

                        if (geojson.write(JSON.stringify(layer))) {
                            geojson.emit('finishLayer', layer.name);
                            writeLayer(layerIndex + 1);
                        } else {
                            geojson.once('drain', function() {
                                geojson.emit('finishLayer', layer.name);
                                writeLayer(layerIndex + 1);
                            });
                        }
                    }
                    
                    geojson.emit('tileLoaded', vtile, size, tileCoords);
                    writeLayer(0);
                });
            }
            getOneTile(0);
            return geojson;
        }
    });
}

module.exports = VtStreamer;