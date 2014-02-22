var vtDump = require('vt-dumper');
var geojsonStream = require('geojson-stream');

var VtStreamer = function(tileJson, callback) {
    vtDump(tileJson, function(err, getTile) {
        if (err) return callback(err);

        callback(null, streamTile);

        function streamTile(coords) {
            var geojson = geojsonStream.parse();

            getTile(coords, function (err, data, vtile, size) {
                if (err) return geojson.emit('error', err);

                function closeStream() { geojson.end(); }

                function writeLayer(index) {
                    if (index === data.length) return closeStream();

                    var layer = data[index];
                    geojson.emit('startLayer', layer.name);

                    if (geojson.write(JSON.stringify(layer))) {
                        geojson.emit('finishLayer', layer.name);
                        writeLayer(index + 1);
                    } else {
                        geojson.once('drain', function() {
                            geojson.emit('finishLayer', layer.name);
                            writeLayer(index + 1);
                        });
                    }
                }
                
                geojson.emit('tileLoaded', vtile, size);
                writeLayer(0);
            });

            return geojson;
        }
    });
}

module.exports = VtStreamer;