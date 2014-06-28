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
        res += '<text x="' + (tl.x) + '" y="' + (tl.y-tl.h) + '" style=" alignment-baseline:text-before-edge; font-family:' + tl.fontFamily + '; font-size:' + tl.fontSize + 'px; color:black;">';
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
    //sharemapjs.fakeData = true;
    //sharemapjs.randomProvider = fakeRandom;
    /* Imports */
    var Places = sharemapjs.Places;
    var LabelPoint = sharemapjs.LabelPoint;

    var projectPoint = sharemapjs.projectPoint;
    var annealInSerial = sharemapjs.annealInSerial;
    /* */

    
    places = new Places();
    var pointArr = [];


    var t1 = (new Date()).getTime();

    var sl = false;

    pointArr.push(['New York', 'fonts/Arial.ttf', 12, {lon: -74.005970, lat: 40.714270}, {x: -842.023481, y: 508.004716}, 8, {'preferred_placement': 'bottom right', 'point_size': 8, 'name': 'New York', 'geonameid': 5128581, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'New York City', 'admin1_code': 'NY', 'population': 8008278}]);
    if (!sl) {
        pointArr.push(['Los Angeles', 'fonts/Arial.ttf', 12, {lon: -118.243680, lat: 34.052230}, {x: -1345.350315, y: 412.494103}, 8, {'preferred_placement': 'bottom left', 'point_size': 8, 'name': 'Los Angeles', 'geonameid': 5368361, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Los Angeles', 'admin1_code': 'CA', 'population': 3694820}]);
        pointArr.push(['Chicago', 'fonts/Arial.ttf', 12, {lon: -87.650050, lat: 41.850030}, {x: -997.262791, y: 525.201633}, 8, {'preferred_placement': 'top right', 'point_size': 8, 'name': 'Chicago', 'geonameid': 4887398, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Chicago', 'admin1_code': 'IL', 'population': 2841952}]);
        pointArr.push(['Houston', 'fonts/Arial.ttf', 12, {lon: -95.363270, lat: 29.763280}, {x: -1085.022094, y: 354.985617}, 8, {'preferred_placement': '', 'point_size': 8, 'name': 'Houston', 'geonameid': 4699066, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Houston', 'admin1_code': 'TX', 'population': 2027712}]);
    }
    pointArr.push(['Philadelphia', 'fonts/Arial.ttf', 12, {lon: -75.163790, lat: 39.952340}, {x: -855.196900, y: 496.632140}, 8, {'preferred_placement': '', 'point_size': 8, 'name': 'Philadelphia', 'geonameid': 4560349, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Philadelphia', 'admin1_code': 'PA', 'population': 1517550}]);
    if (!sl) {
        pointArr.push(['Dallas', 'fonts/Arial.ttf', 12, {lon: -96.806670, lat: 32.783060}, {x: -1101.444779, y: 395.192962}, 8, {'preferred_placement': '', 'point_size': 8, 'name': 'Dallas', 'geonameid': 4684888, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Dallas', 'admin1_code': 'TX', 'population': 1211704}]);
        pointArr.push(['San Francisco', 'fonts/Arial.ttf', 12, {lon: -122.441510, lat: 37.767460}, {x: -1393.112292, y: 464.703153}, 8, {'preferred_placement': 'bottom left', 'point_size': 8, 'name': 'San Francisco', 'geonameid': 5391959, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'San Francisco', 'admin1_code': 'CA', 'population': 732072}]);
        pointArr.push(['Boston', 'fonts/Arial.ttf', 12, {lon: -71.059770, lat: 42.358430}, {x: -808.502272, y: 532.998246}, 8, {'preferred_placement': 'top right', 'point_size': 8, 'name': 'Boston', 'geonameid': 4930956, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Boston', 'admin1_code': 'MA', 'population': 589141}]);
        pointArr.push(['Seattle', 'fonts/Arial.ttf', 12, {lon: -122.332070, lat: 47.606210}, {x: -1391.867108, y: 617.500792}, 8, {'preferred_placement': 'top left', 'point_size': 8, 'name': 'Seattle', 'geonameid': 5809844, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Seattle', 'admin1_code': 'WA', 'population': 569369}]);
        pointArr.push(['Denver', 'fonts/Arial.ttf', 12, {lon: -104.984700, lat: 39.739150}, {x: -1194.492587, y: 493.472828}, 8, {'preferred_placement': '', 'point_size': 8, 'name': 'Denver', 'geonameid': 5419384, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Denver', 'admin1_code': 'CO', 'population': 554636}]);
        pointArr.push(['Washington', 'fonts/Arial.ttf', 12, {lon: -77.036370, lat: 38.895110}, {x: -876.502699, y: 481.059602}, 8, {'preferred_placement': 'bottom right', 'point_size': 8, 'name': 'Washington', 'geonameid': 4140963, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Washington', 'admin1_code': 'DC', 'population': 552433}]);
        pointArr.push(['Atlanta', 'fonts/Arial.ttf', 12, {lon: -84.387980, lat: 33.749000}, {x: -960.147684, y: 408.337398}, 8, {'preferred_placement': '', 'point_size': 8, 'name': 'Atlanta', 'geonameid': 4180439, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Atlanta', 'admin1_code': 'GA', 'population': 422908}]);
        pointArr.push(['Miami', 'fonts/Arial.ttf', 12, {lon: -80.193660, lat: 25.774270}, {x: -912.425643, y: 303.676248}, 8, {'preferred_placement': 'bottom right', 'point_size': 8, 'name': 'Miami', 'geonameid': 4164138, 'font_file': 'fonts/Arial.ttf', 'font_size': 12, 'country_code': 'US', 'asciiname': 'Miami', 'admin1_code': 'FL', 'population': 382894}]);
    }
    oldTime = 0;


    var minX = 1000000;
    var minY = 1000000;

    var zoomLevel = 3;
    //zoomLevel = 2;

    var projectPoint = sharemapjs.projectPoint;

    for (var i = 0; i < pointArr.length; i++) {
        point = pointArr[i];
        loc = point[3];
        pos = projectPoint(loc.lat, loc.lon, zoomLevel);
        point[4] = pos;
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
    }
    var p;
    minX -= 200;
    minY -= 200;
    var out = "";
    places.buffer = 0;
    for (var i = 0; i < pointArr.length; i++) {
        p = pointArr[i];
        pos = p[4];
        pos.x -= minX;
        pos.y -= minY;
        p[1] = "DejaVuSerif";
        p[2] = 12;
        p[6] = 1; //Replacing radius
        places.buffer = 0;
        var lp = new LabelPoint(p[0], p[1], p[2], p[3], p[4], p[5], p[6]);
        console.log("places.add(Point(\"" + p[0] + "\",", "\"" + p[1] + "\"", ",", p[2], ", LMM(", p[3].lat, ",", p[3].lon, "), PMM(", p[4].x, ",", p[4].y, "),", p[5], ",{}));\n");
        places.add(lp);
    }
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
    ais = labeler.annealInSerial(places);
    // timeTrack();*/
    /*
     var ctx = document.getElementById("c").getContext("2d");
     
     
     */

    var placesArr = ais;// ? ais : places.places;
    if (window.hasOwnProperty("$")) {
        var svg = '<svg width="1000px" height="600px">';
        for (var i = 0; i < placesArr.length; i++)
                // var i =5;
                {
                    var place = placesArr[i];
                    var geom = place.label_shape;
                    var pGeom = place.point_shape;
                    //var mGeom = place.mask_shapes;
                    svg = drawGeometry(pGeom, svg);
                    svg = drawGeometry(geom, svg);
                    // mGeom.draw(ctx);

                }
        svg += "</svg>";
        console.log(svg);

        $("body").append(svg);

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
    }

    debug("End time: " + (new Date()));

}