function drawPolygon(polygon, res) {
    if (!res) {
        res = "";
    }
    res += '<polygon style="fill:lime;stroke:purple;stroke-width:1"  points="';
    _ref = polygon.vertices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        res += vertex.x + "," + vertex.y + " ";
    }
    res += '"/>';
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
        res += '<text x="' + (tl.x) + '" y="' + (tl.y - tl.h) + '" style=" alignment-baseline:text-before-edge; font-family:' + tl.fontFamily + '; font-size:' + tl.fontSize + 'px; color:black;">';
        res += tl.text;
        res += '</text>';
    }
    return res;
}


function drawOrUpdate(lp) {
    var svgContainer = d3.select("body").append("svg")
            .attr("width", 200)
            .attr("height", 200);

    var dataset

    svgContainer.data(dataset).enter()
            .append("g")
            .append("polygon")
            .attr("points", function(d) {
                return d.values.map(function(e) {
                    return e.x + "," + e.y;
                }).join(" ");
            })
            .style("fill", "brown");
}


function runLabelerTest1() {
    drawOrUpdate(null);
}

function init() {
    var textMeasureHtml = new TextMeasureHtml(sharemapjs.textMeasureHtmlVisible);
    textMeasureHtml.init();
    sharemapjs.TextMeasure = textMeasureHtml;
    runLabelerTest();
}


function runLabelerTest() {

    debug("Start time: " + (new Date()));
    sharemapjs.fakeData = true;
    sharemapjs.randomProvider = fakeRandom;
    /* Imports */
    var Places = sharemapjs.Places;
    var LabelPoint = sharemapjs.LabelPoint;

    var projectPoint = sharemapjs.projectPoint;
    var annealInSerial = sharemapjs.annealInSerial;
    /* */


    places = new Places();
    var pointArr = [];


    var t1 = (new Date()).getTime();

    oldTime = 0;


    var minX = 1000000;
    var minY = 1000000;

    var zoomLevel = 2;
    //zoomLevel = 2;

    var projectPoint = sharemapjs.projectPoint;
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
    zoomLevel = 6;
    var inpPlaces = window.USz6;
    for (var i = 0; i < inpPlaces.length; i++) {
        var point = inpPlaces[i];
        console.log(point);
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
    for (var i = 0; i < inpPlaces.length; i++) {
        point = inpPlaces[i];
        console.log(point);
        pos = point.pos;
        pos.x -= minX;
        pos.y -= minY;
        places.buffer = 0;
        var lp = new LabelPoint(point.name, "DejaVuSerif", 12, {
            lat: point.lat,
            lng: point.lng
        }, pos, point, 1);
        //console.log("places.add(Point(\"" + p[0] + "\",", "\"" + p[1] + "\"", ",", p[2], ", LMM(", p[3].lat, ",", p[3].lon, "), PMM(", p[4].x, ",", p[4].y, "),", p[5], ",{}));\n");
        places.add(lp);
    }
    console.log(places);
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

    timeTrack();


    var ais = null;
    var labeler = new Labeler();
    var labelerOpts = {
        minutes: 0.3
    }
    ais = labeler.annealInSerial(places, labelerOpts);
    // timeTrack();*/
    /*
     var ctx = document.getElementById("c").getContext("2d");
     
     
     */

    var placesArr = ais;// ? ais : places.places;
    if (window.hasOwnProperty("$")) {
        var svg = '<svg width="5000px" height="5000px" id="resultSvg">';
        for (var i = 0; i < placesArr.length; i++)
                // var i =5;
                {
                    try{
                    var place = placesArr[i];
                    var geom = place.label_shape;
                    var pGeom = place.point_shape;
                    //var mGeom = place.mask_shapes;
                    svg = drawGeometry(pGeom, svg);
                    svg = drawGeometry(geom, svg);
                    // mGeom.draw(ctx);
                } catch (err){
                    console.error(err);
                }

                }
        svg += "</svg>";
        console.log(svg);
        if ($){
        $("body").append("<div id='svgContainer'>"+svg+"</div>");

        for (var i = 0; i < placesArr.length; i++) {
            for (var j = 0; j < placesArr.length; j++) {
                var place1 = placesArr[i];
                var place2 = placesArr[j];
                if (i != j) {
                    if (place1.overlaps(place2)) {
                        console.log(place1.name + " overlasp " + place2.name);
                    }
                }
            }
        }
        } else {
            
        }
    }

    debug("End time: " + (new Date()));

}