var Labeler = sharemapdymo.Labeler;
sharemapdymo.randomProvider = sharemapdymo.fakeRandom;



function drawPolygon(polygon, res) {
    if (!res) {
        res = "";
    }
    res += '<polygon style="fill:lime;stroke:purple;stroke-width:1"  points="';
    var _ref = polygon.vertices;
    for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
        var vertex = _ref[_i];
        res += vertex.x + "," + vertex.y + " ";
    }
    res += '"/>\n';
    return res;
}


function drawGeometry(geometry, res) {
    if (!res) {
        res = "";
    }
    for (var i = 0; i < geometry.polygons.length; i++) {
        var polygon = geometry.polygons[i];
        res = drawPolygon(polygon, res);
    }
    var tl = geometry.textLabel;
    if (tl) {
        res += '<text x="' + (tl.x) + '" y="' + (tl.y) + '" style=" alignment-baseline:xtext-before-edge; font-family:' + sharemapdymo.TextMeasure.extractFontName(tl.fontFamily) + '; font-size:' + tl.fontSize + 'px; color:black;">';
        res += tl.text;
        res += '</text>\n';
    }
    return res;
}





var runLabelerTest = function() {

    debug("Start time: " + (new Date()));
    sharemapdymo.fakeData = true;
    //fontInitHandler();
    sharemapdymo.TextMeasure.init(["DejaVuSerif.ttf"], fontInitHandler);
}

var fontInitHandler = function() {
    /* Imports */
    var Places = sharemapdymo.Places;
    var LabelPoint = sharemapdymo.LabelPoint;

    var projectPoint = sharemapdymo.projectPoint;
    /* */


    var places = new Places();


    var t1 = (new Date()).getTime();

    var oldTime = 0;


    var minX = 1000000;
    var minY = 1000000;

    var zoomLevel = 8;
    //zoomLevel = 2;

    var projectPoint = sharemapdymo.projectPoint;
    /*
     for (var i = 0; i < pointArr.length; i++) {
     point = pointArr[i];
     loc = point[3];
     pos = projectPoint(loc.lat, loc.lon, zoomLevel);
     point[4] = pos;
     minX = Math.min(minX, pos.x);
     minY = Math.min(minY, pos.y);
     }
     */
    var allPlaces = false;
    if (allPlaces) {
        zoomLevel = 6;
        var inpPlaces = USz6;
        for (var i = 0; i < inpPlaces.length; i++) {
            var point = inpPlaces[i];
            // console.log(point);
            var pos = projectPoint(point.lat, point.lng, zoomLevel);
            point.pos = pos;
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
        }

        var p;
        minX -= 200;
        minY -= 200;
        var out = "";
        places.buffer = 0;
        var cities = ["New York City", "Boston"];
        cities = null;
        for (var i = 0; i < inpPlaces.length; i++) {
            point = inpPlaces[i];
            if ((cities!=null)&&(cities.indexOf(point.name) == -1))
                continue;
            //console.log(point);
            pos = point.pos;
            pos.x -= minX;
            pos.y -= minY;
            places.buffer = 0;
            var lp = new LabelPoint(point.name, "DejaVuSerif.ttf", (point.population > 1000000 ? 20 : 14), {
                lat: point.lat,
                lng: point.lng
            }, pos, point, 1);
            if (lp == null) {
                throw Error("AX");
            }
            //console.log("places.add(Point(\"" + p[0] + "\",", "\"" + p[1] + "\"", ",", p[2], ", LMM(", p[3].lat, ",", p[3].lon, "), PMM(", p[4].x, ",", p[4].y, "),", p[5], ",{}));\n");
            places.add(lp);
        }
    }
    else {
        sharemapdymo.TextMeasure = new sharemapdymo.TextMeasurePreset();
        var LMM = function(lat, lng) {
            return {
                lat: lat,
                lng: lng
            }
        }

        var PMM = function(x, y) {
            return {
                x: x,
                y: y
            }
        }

        places.add(new LabelPoint("New York", "fonts/Arial.ttf", 12, LMM(40.71427, -74.00597), PMM(203.2933546666668, 200), 1, {}));
        places.add(new LabelPoint("Philadelphia", "fonts/Arial.ttf", 12, LMM(39.95234, -75.16379), PMM(200, 202.84314394819785), 1, {}));
    }
    //console.log(places);
    //return;
    //return;
    var t2 = (new Date()).getTime();

    console.log("Time ", (t2 - t1) / 1000);
    ri = 0;

    var timeTrack = function() {
        var newTime = (new Date()).getTime();
        console.log(newTime - oldTime);
        oldTime = newTime;
    };

    console.log("start");

    timeTrack();



    var ais = null;
    var labeler = new Labeler();
    var labelerOpts = {
        minutes: 0.1
    }
    ais = labeler.annealInSerial(places, labelerOpts);
    // timeTrack();*/
    /*
     var ctx = document.getElementById("c").getContext("2d");
     
     
     */

    var placesArr = ais;// ? ais : places.places;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="5000px" height="5000px" id="resultSvg">\n';
    svg += "<defs>\n"
    svg += '<style type="text/css">\n';
    svg += "<![CDATA[\n";
    for (var key in sharemapdymo.TextMeasure.fonts) {
        svg += "@font-face {\n";
        svg += "font-family: " + key + ";\n";
        svg += "src: url('../fonts/" + key + ".ttf');\n";
    }

    svg += "]]>\n"

    svg += "</style>\n";
    svg += "</defs>\n";
    for (var i = 0; i < placesArr.length; i++)
            // var i =5;
            {
                try {
                    var place = placesArr[i];
                    var geom = place.label_shape;
                    var pGeom = place.point_shape;
                    //var mGeom = place.mask_shapes;
                    svg = drawGeometry(pGeom, svg);
                    svg = drawGeometry(geom, svg);
                    // mGeom.draw(ctx);
                } catch (err) {
                    console.log(err);
                    console.error(err);
                }

            }
    svg += "</svg>";
    if (typeof saveFile === 'function') {
        saveFile(svg);

    } else {
        $("body").append("<div id='svgContainer'>" + svg + "</div>");


    }
    for (var i = 0; i < placesArr.length; i++) {
        var place = placesArr[i];
        console.log(i + (place != null ? (" [" + place._orgId + "] " + place.name) : "null"));
    }
    for (var i = 0; i < placesArr.length; i++) {
        for (var j = 0; j < placesArr.length; j++) {
            var place1 = placesArr[i];
            var place2 = placesArr[j];
            if (place1 == null) {
                console.log("P1 null" + i);
                continue;
            }
            if (place2 == null) {
                console.log("P2 null " + j);
                continue;
            }

            if (i != j) {
                if (place1.overlaps(place2)) {
                    console.log(place1.name + " overlaps " + place2.name);
                }
            }
        }
    }

    debug("End time: " + (new Date()));

}

if (typeof module === 'object' && module.exports) {
    module.exports.runLabelerTest = runLabelerTest;
}
