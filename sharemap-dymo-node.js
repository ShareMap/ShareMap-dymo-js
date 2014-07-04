(function(){
var sharemapdymo = {};
if (!opentype){
var opentype = require(__dirname + "/lib/opentype-js/opentype.js");
}
var isArray = function(arg){
   return  Array.isArray(arg);
}/*
 * Depends on OpenType.js
 */

var TextMeasureOpenType = function() {
    this.initializedHandler = null;
    this.fontDir = "../fonts/";
    this.fontArr = [];
    this.mainFont = null;
    this.fontsArrToInit = [];
    this.fonts = {};
};

TextMeasureOpenType.prototype.init = function(fontArr, initializedHandler) {
    this.initializedHandler = initializedHandler;
    this.fontArr = [];
    this.fontsArrToInit = [];
    for (var i = 0; i < fontArr.length; i++) {
        var fontSrc = fontArr[i];
        if (fontSrc.indexOf("/")===-1) fontSrc = this.fontDir+fontSrc;
        this.fontArr.push(fontSrc);
        this.fontsArrToInit.push(fontSrc);
    }
    this.initNextFont();
};

TextMeasureOpenType.prototype.initNextFont = function() {
    for (var i = 0; i < this.fontsArrToInit.length; i++) {
        var fontSrc = this.fontsArrToInit[i];
        if (fontSrc !== null) {
            this.initFont(fontSrc);
            this.fontsArrToInit[i] = null;
            return;
        }
    }
    this.initializedHandler();
}

TextMeasureOpenType.prototype.initFont = function(fontSrc) {
    var that = this;
    opentype.load(fontSrc, function(err, font) {
        var fontName = that.extractFontName(fontSrc);
        if (err) {
            console.log(err);
        } else {
            console.log("Initialized font " + fontName + " [" + fontSrc + "]");
        }
        console.log(that);
        that.fonts[fontName] = font;
        that.initNextFont();
    });
};

TextMeasureOpenType.prototype.extractFontName = function(fontSrc) {
    var s = fontSrc;
    var ind = s.lastIndexOf("/");
    s = s.substr(ind + 1, s.length);
    s = s.replace(".ttf", "");
    s = s.replace(".otf", "");
    return s;
};

TextMeasureOpenType.prototype.measureText = function(text, fontSize, fontSrc) {
    var fontName = this.extractFontName(fontSrc);
    var font = this.fonts[fontName];
    var glyphArr = font.stringToGlyphs(text);
    scale = 1 / font.unitsPerEm * fontSize;
    var width = 0;
    var minY = 1000000;
    var maxY = -1000000;
    for (var i = 0; i < glyphArr.length; i++) {
        var g = glyphArr[i];
        width += g.advanceWidth;
        if (g.yMin < minY)
            minY = g.yMin;
        if (g.yMax > maxY)
            maxY = g.yMax;

    }
    var height = font.ascender + Math.abs(font.descender);
    var w = (width * scale);
    var h = (height * scale);
    var res = {
        w: w,
        h: h,
        b: 0, // TODO: Add baseline support,
        text: text,
        size: fontSize,
        font: fontName
    };
    return res;
};
sharemapdymo.TextMeasureOpenType = TextMeasureOpenType;
sharemapdymo.TextMeasure = new TextMeasureOpenType();

var objDeepCopy = function(obj, objDict) {
    if ((null === obj) || ("object" !== typeof obj)) {
        return obj;
    }
    if (!objDict) {
        objDict = {};
    }
    var objId = null;
    if (obj.hasOwnProperty("_id")) {
        objId = obj._id;
    }
    if ((objId) && (objDict.hasOwnProperty(objId))) {
        return objDict[objId];
    }
    var res = null;
    if (obj.deepCopy) {
        res = obj.deepCopy(objDict);
    } else if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        res = copy;
    } else if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = objDeepCopy(obj[i], objDict);
        }
        res = copy;
    } else if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if ((obj.hasOwnProperty(attr)) && (attr != 'hash'))
                copy[attr] = objDeepCopy(obj[attr], objDict);
        }
        res = copy;
    }
    if (res != null) {
        if (objId) {
            objDict[objId] = res;
        }
        if (res.hashable === true) {
            res.hash = Math.round(Math.random() * 1000000);
        }
        return res;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
}
sharemapdymo.objDeepCopy = objDeepCopy;

var projectMercator = function(lam, phi, out) {
    out.x = lam;
    out.y = Math.log(Math.tan(Math.PI / 4.0 + 0.5 * phi));
}
sharemapdymo.projectMercator = projectMercator;

var projectPoint = function(lat, lng, z) {
    var Vector = sharemapdymo.Vector;
    var dimension = 256 * Math.pow(2, z);
    var DTR = Math.PI / 180.0;
    var res = {};
    projectMercator(lng * DTR, lat * DTR, res);
    res.x = (res.x / Math.PI + 1) / 2 * dimension;
    res.y = ((-res.y) / Math.PI + 1) / 2 * dimension;
    if (res.x < 0)
        res.x = 0;
    if (res.x > dimension)
        res.x = dimension;
    if (res.y < 0)
        res.y = 0;
    if (res.y > dimension)
        res.y = dimension;
    res.x -= 2000;
    ;
    res.y -= 3000;
    return res;
}
sharemapdymo.projectPoint = projectPoint;

var objKeys = function(obj) {
    var res = [];
    for (var key in obj) {
        res.push(key);
    }
    return res;
};
sharemapdymo.projectPoint = projectPoint;


var radians = function(deg) {
    return deg * (Math.PI / 180);
};
sharemapdymo.radians = radians;

/* TODO: rename to routeMove */
var routeMove = function(state) {
    var stateLen = state.length;
    /*Swaps two cities in the route.*/
    var a = randomInt(0, stateLen - 1)
    var b = randomInt(0, stateLen - 1)
    var stateSwap = state[a];
    state[a] = state[b];
    state[b] = stateSwap;
};
sharemapdymo.route_move = routeMove;


var distance = function(a, b) {
    var R = 3963  // radius of Earth (miles)
    var lat1 = this.radians(a[0]);
    var lon1 = this.radians(a[1]);
    var lat2 = this.radians(b[0]);
    var  lon2 = this.radians(b[1]);
    var res = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)) * R;
    return res;
};
sharemapdymo.distance = distance;


var random = function(caller) {
    var randomProvider;
    if (sharemapdymo.hasOwnProperty("randomProvider")) {
        randomProvider = sharemapdymo.randomProvider;
    } else {
        randomProvider = Math.random;
    }
    var res = randomProvider();
    return res;
};
sharemapdymo.random = random;

var randomInt = function(minimum, maximum, caller) {
    var r = random(caller);
    var res = Math.floor(r * (maximum - minimum + 1)) + minimum;
    return res;
};
sharemapdymo.randomInt = randomInt;

var LEVEL2 = 2;
var debugLevel = LEVEL2;


var debug = function(msg, level) {
    if ((!level) || (level <= debugLevel)) {
        console.log(msg);
    }
}

sharemapdymo.debug = debug;

var isFloat = function(n) {
    return n != "" && !isNaN(n) && Math.round(n) != n;
};
sharemapdymo.isFloat = debug;


var debugCols = function(prefix, arr, suffix, level) {
    var row = prefix;
    for (var i = 0; i < arr.length; i++) {
        var o = arr[i];
        var s = 0;
        if (isFloat(o)) {
            s = (Math.round(o * 1000) / 1000).toString();
        } else {
            s = arr[i].toString();
        }
        for (var j = s.length; j < 10; j++) {
            s = " " + s
        }
        row += s;
    }
    debug(row, level);

};
sharemapdymo.debugCols = debugCols;

var log10 = function(x) {
    return Math.log(x) / Math.LN10;
};
sharemapdymo.log10 = log10;

var shuffle = function(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
};
sharemapdymo.shuffle = shuffle;

var rotateArr = function(arr) {
    arr.unshift(arr.pop());
}

sharemapdymo.rotateArr = rotateArr;

var generatePlacelistResult = function(places, indexes) {
    var res = [];
    for (var i = 0; i < places.places.length; i++) {
        var place = places.places[i];
        res.push([indexes[i], place]);
    }
    return res;
};
sharemapdymo.generatePlacelistResult = generatePlacelistResult;

var fillArray = function(len, val) {
    var res = [];
    for (var i = 0; i < len; i++) {
        res.push(val);
    }
    return res;
};

sharemapdymo.fillArray = fillArray;


function round_figures(x, n)
{

    /*Returns x rounded to n significant figures.*/
    var res = round(x, int(n - Math.ceil(log10(Math.abs(x)))));
    return res;
}

function float(x) {
    return x + 0.0;
}

function int(x) {
    return Math.floor(x);
}

function round(x, n) {
    if ((!n) || (n === 0)) {
        return Math.round(x);
    } else {
        var mult = Math.pow(10, n);
        return (Math.round(x * mult) / mult);
    }
}

function divmod(x, y) {
    var q = Math.floor(x / y);
    var r = x - q * y;
    return {
        q: q, r: r
    };
}




function time_string(seconds)
{

    /*Returns time in seconds as a string formatted HHHH:MM:SS.*/
    var s = round(seconds); // round to nearest second
    var hs = divmod(s, 3600);   // get hours and remainder
    var h = hs.q;
    hs = divmod(hs.r, 60);    // split remainder into minutes and seconds
    var m = hs.q;
    var s = hs.r;
    return "" + h + m + s;
}

function time() {
    return (new Date()).getTime() / 1000;
}


var choice = function(objArr) {
    var arr = null;
    if (!isArray(objArr)) {
        arr = [];
        for (var key in objArr) {
            arr.push(key);
        }
    } else {
        arr = objArr;
    }
    var max = arr.length - 1;
    var idx = randomInt(0, max, "choice");
    var s = "";
    for (var i = 0; i < arr.length; i++) {
        s += "" + arr[i] + (i == idx ? "!" : "") + " ,";
    }
    var res = arr[idx];
    debug("Choice " + (res.hasOwnProperty("name") ? res.name : res) + " [" + idx + " max " + max + "] [RI: " + ri + "]", LEVEL2);

    return res;
}

var fmtF6 = function(fNum) {
    var str = fNum.toString();
    var ind = str.indexOf(".");
    if (ind < 0) {
        str += ".000000";
    } else {
        str += "000000";
    }
    ind = str.indexOf(".");
    str = str.substr(0, ind + 7);
    return str;
}

sharemapdymo.choice = choice;

//(function() {
//sharemapdymo.static.hasProp = {}.hasOwnProperty,
/*    sharemapdymo.static.extends = function(child, parent) {
 for (var key in parent) {
 if (__hasProp.call(parent, key))
 child[key] = parent[key];
 }
 function ctor() {
 this.constructor = child;
 }
 ctor.prototype = parent.prototype;
 child.prototype = new ctor();
 child.__super__ = parent.prototype;
 return child;
 };*/

var Vector = function(x, y) {
    this.x = x;
    this.y = y;
    this.set(x, y);
}

Vector.prototype.set = function(x, y) {
    this.x = x != null ? x : 0.0;
    this.y = y != null ? y : 0.0;
    return this;
};
Vector.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
};
Vector.prototype.scale = function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
};
Vector.prototype.div = function(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
};
Vector.prototype.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y;
};
Vector.prototype.min = function(vector) {
    this.x = Math.min(this.x, vector.x);
    return this.y = Math.min(this.y, vector.y);
};
Vector.prototype.max = function(vector) {
    this.x = Math.max(this.x, vector.x);
    return this.y = Math.max(this.y, vector.y);
};
Vector.prototype.lt = function(vector) {
    return this.x < vector.x || this.y < vector.y;
};
Vector.prototype.gt = function(vector) {
    return this.x > vector.x || this.y > vector.y;
};
Vector.prototype.normalize = function() {
    var mag;
    mag = Math.sqrt(this.x * this.x + this.y * this.y);
    if (mag !== 0) {
        this.x /= mag;
        return this.y /= mag;
    }
};
Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
};
sharemapdymo.Vector = Vector;
var Edge = function(pointA, pointB) {
    this.pointA = pointA;
    this.pointB = pointB;
}

Edge.prototype.intersects = function(other, ray) {
    var d, dx1, dx2, dx3, dy1, dy2, dy3, r, s;
    if (ray == null) {
        ray = false;
    }
    dy1 = this.pointB.y - this.pointA.y;
    dx1 = this.pointB.x - this.pointA.x;
    dx2 = this.pointA.x - other.pointA.x;
    dy2 = this.pointA.y - other.pointA.y;
    dx3 = other.pointB.x - other.pointA.x;
    dy3 = other.pointB.y - other.pointA.y;
    if (dy1 / dx1 !== dy3 / dx3) {
        d = dx1 * dy3 - dy1 * dx3;
        if (d !== 0) {
            r = (dy2 * dx3 - dx2 * dy3) / d;
            s = (dy2 * dx1 - dx2 * dy1) / d;
            if (r >= 0 && (ray || r <= 1)) {
                if (s >= 0 && s <= 1) {
                    return new Vector(this.pointA.x + r * dx1, this.pointA.y + r * dy1);
                }
            }
        }
    }
}

sharemapdymo.Edge = Edge;
var Polygon = function(vertices, edges) {
    this.vertices = vertices != null ? vertices : [];
    this.edges = edges != null ? edges : [];
    this.colliding = false;
    this.center = new Vector;
    this.bounds = {
        min: new Vector,
        max: new Vector
    };
    this.edges = [];
    if (this.vertices.length > 0) {
        this.computeCenter();
        this.computeBounds();
        this.computeEdges();
    }
}

Polygon.prototype.generateFromPoint = function(cx, cy, r, p) {
    this.generator = {
        type: "point",
        cx: cx,
        cy: cy,
        r: r,
        p: p
    }
    if (!p) {
        p = 12;
    }
    var h = cx;
    var k = cy;
    theta = 0; // angle that will be increased each loop
    var step = 2 * Math.PI / p;
    var vertices = [];
    for (var theta = 0; theta < 2 * Math.PI; theta += step)
    {
        var x = h + r * Math.cos(theta);
        var y = k - r * Math.sin(theta); //note 2
        vertices.push(new Vector(x, y));
    }
    this.vertices = vertices;
    this.computeCenter();
    this.computeBounds();
    this.computeEdges();
}

Polygon.prototype.generateFromRect = function(x1, y1, x2, y2) {
    if (x1 > x2) {
        var tmpX = x2;
        x2 = x1;
        x1 = tmpX;
    }
    if (y1 > y2) {
        var tmpY = y2;
        y2 = y1;
        y1 = tmpY;
    }
    this.generator = {
        type: "rect",
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
    }
    var vertices = [];
    vertices.push(new Vector(x1, y1));
    vertices.push(new Vector(x2, y1));
    vertices.push(new Vector(x2, y2));
    vertices.push(new Vector(x1, y2));
    this.vertices = vertices;
    this.computeCenter();
    this.computeBounds();
    this.computeEdges();
}

Polygon.prototype.generateBuffer = function(distance) {
    var res = new Polygon();
    if (this.generator.type === "rect") {
        var x1 = this.generator.x1;
        var y1 = this.generator.y1;
        var x2 = this.generator.x2;
        var y2 = this.generator.y2;
        x1 -= distance;
        y1 -= distance;
        x2 += distance;
        y2 += distance;
        res.generateFromRect(x1, y1, x2, y2);
    } else if (this.generator.type === "point") {
        var cx = this.generator.cx;
        var cy = this.generator.cy;
        var r = this.generator.r;
        var p = this.generator.p;
        r += distance;
        res.generateFromPoint(cx, cy, r, p);
    } else {
        throw new Error("Buffer not allowed");
    }
    return res;
}

Polygon.prototype.translate = function(vector) {
    var vertex, _i, _len, _ref, _results;
    this.center.add(vector);
    this.bounds.min.add(vector);
    this.bounds.max.add(vector);
    _ref = this.vertices;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        _results.push(vertex.add(vector));
    }
    return _results;
};
Polygon.prototype.rotate = function(radians, pivot) {
    var c, dx, dy, s, vertex, _i, _len, _ref, _results;
    if (pivot == null) {
        pivot = this.center;
    }
    s = Math.sin(radians);
    c = Math.cos(radians);
    _ref = this.vertices;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        dx = vertex.x - pivot.x;
        dy = vertex.y - pivot.y;
        vertex.x = c * dx - s * dy + pivot.x;
        _results.push(vertex.y = s * dx + c * dy + pivot.y);
    }
    return _results;
};
Polygon.prototype.computeCenter = function() {
    var vertex, _i, _len, _ref;
    this.center.set(0, 0);
    _ref = this.vertices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        this.center.add(vertex);
    }
    return this.center.div(this.vertices.length);
};
Polygon.prototype.computeBounds = function() {
    var vertex, _i, _len, _ref, _results;
    this.bounds.min.set(Number.MAX_VALUE, Number.MAX_VALUE);
    this.bounds.max.set(-Number.MAX_VALUE, -Number.MAX_VALUE);
    _ref = this.vertices;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        this.bounds.min.min(vertex);
        _results.push(this.bounds.max.max(vertex));
    }
    return _results;
};
Polygon.prototype.computeEdges = function() {
    var index, vertex, _i, _len, _ref, _results;
    this.edges.length = 0;
    _ref = this.vertices;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        vertex = _ref[index];
        _results.push(this.edges.push(new Edge(vertex, this.vertices[(index + 1) % this.vertices.length])));
    }
    return _results;
};
Polygon.prototype.contains = function(vector) {
    var edge, intersections, minX, minY, outside, ray, _i, _len, _ref;
    if (vector.x > this.bounds.max.x || vector.x < this.bounds.min.x) {
        return false;
    }
    if (vector.y > this.bounds.max.y || vector.y < this.bounds.min.y) {
        return false;
    }
    minX = (function(_this) {
        return function(o) {
            return o.x;
        };
    })(this);
    minY = (function(_this) {
        return function(o) {
            return o.y;
        };
    })(this);
    outside = new Vector(Math.min.apply(Math, this.vertices.map(minX)) - 1, Math.min.apply(Math, this.vertices.map(minY)) - 1);
    ray = new Edge(vector, outside);
    intersections = 0;
    _ref = this.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
        if (ray.intersects(edge, true)) {
            ++intersections;
        }
    }
    return !!(intersections % 2);
};

Polygon.prototype.collides = function(polygon) {
    //var g1 = polygon.generator;
    //var g2 = this.generator;
    //if ((g1) && (g2) && (g1.type == 'rect') && (g2.type == 'rect')) {
    //    return this.rectCollides(g1, g2)
    //}
    //return this.rectCollides(g1, g2)
    return this.polygonCollides(polygon, this);

}

Polygon.prototype.boundsCollides = function(r1, r2) {
    var r1min = r1.bounds.min;
    var r1max = r1.bounds.max;
    var r2min = r2.bounds.min;
    var r2max = r2.bounds.max;
    var r1x1 = r1min.x;
    var r1y1 = r1min.y;
    var r1x2 = r1max.x;
    var r1y2 = r1max.y;
    var r2x1 = r2min.x;
    var r2y1 = r2min.y;
    var r2x2 = r2max.x;
    var r2y2 = r2max.y;

    var xInt = true;
    if (
            ((r1x1 > r2x2) && (r1x2 > r2x2))
            || ((r1x2 < r2x1) && (r1x2 < r2x1))
            )
    {
        xInt = false;
    }

    var yInt = true;
    if (
            ((r1y1 > r2y2) && (r1y2 > r2y2))
            || ((r1y2 < r2y1) && (r1y2 < r2y1))
            )
    {
        yInt = false;
    }

    return ((xInt) && (yInt));

}

Polygon.prototype.polygonCollides = function(p1, p2) {
    var edge, other, overlap, _i, _j, _len, _len1, _ref, _ref1;
    overlap = true;
    if (!this.boundsCollides(p1, p2)) {
        return false;
    }
    /*if (p1.bounds.min.gt(p2.bounds.max)) {
     overlap = false;
     }
     if (p1.bounds.max.lt(p2.bounds.min)) {
     overlap = false;
     }*/
    overlap = false;
    _ref = p2.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
        _ref1 = p1.edges;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            other = _ref1[_j];
            if (edge.intersects(other)) {
                return true;
            }
        }
    }
    return false;
};
Polygon.prototype.wrap = function(bounds) {
    var ox, oy;
    ox = (this.bounds.max.x - this.bounds.min.x) + (bounds.max.x - bounds.min.x);
    oy = (this.bounds.max.y - this.bounds.min.y) + (bounds.max.y - bounds.min.y);
    if (this.bounds.max.x < bounds.min.x) {
        this.translate(new Vector(ox, 0));
    } else if (this.bounds.min.x > bounds.max.x) {
        this.translate(new Vector(-ox, 0));
    }
    if (this.bounds.max.y < bounds.min.y) {
        return this.translate(new Vector(0, oy));
    } else if (this.bounds.min.y > bounds.max.y) {
        return this.translate(new Vector(0, -oy));
    }
};
Polygon.prototype.clone = function(bounds) {
    var vertices = [];
    for (var i = 0; i < this.vertices.length; i++) {
        var vector = this.vertices[i];
        vector = vector.clone();
        vertices.push(vector);
    }
    var res = new Polygon(vertices);
    if (this.generator) {
        res.generator = objDeepCopy(this.generator);
    }
    return res;
}

sharemapdymo.Polygon = Polygon;
var Geometry = function Geometry(polygons) {
    this.polygons = (polygons != null) ? polygons : [];
}

Geometry.prototype.addPolygon = function(polygon) {
    polygon = polygon.clone();
    this.polygons.push(polygon);
}

Geometry.prototype.buffer = function(distance) {
    var polygons2 = [];
    for (var i = 0; i < this.polygons.length; i++) {
        var polygon = this.polygons[i];
        var polygon2 = polygon.generateBuffer(distance);
        polygons2.push(polygon2);
    }
    var geom2 = new Geometry(polygons2);
    return geom2;
}

var time = function() {
    return (new Date()).getTime();
};
Geometry.prototype.intersects = function(geom2) {
    var res = false;
    var t1 = time();
    var geom1 = this;
    for (var i = 0; i < geom1.polygons.length; i++) {
        var polygon1 = geom1.polygons[i];
        for (var j = 0; j < geom2.polygons.length; j++) {
            var polygon2 = geom2.polygons[j];
            if (polygon1.collides(polygon2)) {
                res = true;
                break;
            }
        }
    }
    //  console.log("Intersects "+(time()-t1)+" "+t1);
    return res;
};
Geometry.prototype.union = function(geom2) {
    var geom1 = this;
    var res = Geometry.unionGeometries([geom1, geom2]);
    return res;
}


Geometry.unionGeometries = function(geomArrOrObject) {
    var polygons2 = [];
    var geomArr = [];
    // var isArray = (Array.isArray(geomArrOrObject); //TODO : Check this
    var isArray = ((geomArrOrObject.length) && (geomArrOrObject.length > 0));
    if (isArray) {
        geomArr = geomArrOrObject;
    } else {
        for (var key in geomArrOrObject) {
            var obj = geomArrOrObject[key];
            if ((obj) && (obj.hasOwnProperty("polygons"))) {
                geomArr.push(obj);
            }
        }
    }
    for (var i = 0; i < geomArr.length; i++) {
        var geom2 = geomArr[i];
        for (var j = 0; j < geom2.polygons.length; j++) {
            var polygon = geom2.polygons[j];
            polygon = polygon.clone();
            polygons2.push(polygon);
        }
    }
    var res = new Geometry(polygons2);
    return res;
}

Geometry.prototype.draw = function(ctx) {
    for (var i = 0; i < this.polygons.length; i++) {
        var polygon = this.polygons[i];
        polygon.draw(ctx);
    }
    if (this.textLabel) {
        ctx.font = "12px DejaVu Sans Mono";
        ctx.fillStyle = 'black';
        ctx.fillText(this.textLabel.text, this.textLabel.x, this.textLabel.y);
    }
}

Geometry.generateFromPoint = function(cx, cy, r, p) {
    var polygon = new Polygon();
    polygon.generateFromPoint(cx, cy, r, p);
    return new Geometry([polygon]);
}

Geometry.generateFromRect = function(x1, y1, x2, y2) {
    var polygon = new Polygon();
    polygon.generateFromRect(x1, y1, x2, y2);
    return new Geometry([polygon]);
}

Geometry.prototype.setColor = function(color) {
    for (var i = 0; i < this.polygons.length; i++) {
        var polygon = this.polygons[i];
        polygon.color = color;
    }
}

Geometry.prototype.setTextLabel = function(text, x, y, w, h, fontFamily, fontSize) {
    this.textLabel = {
        text: text,
        x: x,
        y: y,
        w: w,
        h: h,
        fontFamily: fontFamily,
        fontSize: fontSize
    }
}

sharemapdymo.Geometry = Geometry;
var labelPointEquals = function(lp1, lp2) {
    // var x : Number = "33";
    if ((lp1 == null) || (lp2 == null)) {
        return false;
    }
    if (lp1 == lp2) {
        return true;
    }
    return lp1._orgId === lp2._orgId; //TODO: check this
}

var labelPointInSet = function(lp1, lpArr) {
    for (var i = 0; i < lpArr.length; i++) {
        var lp2 = lpArr[i];
        if (labelPointEquals(lp1, lp2))
            return true;
    }
    return false;
};

var labelPointInPlacement = function(lp1, lpArr) {
    if (lpArr.indexOf(lp1.placements) >= 0) {
        return true;
    }
    return false;
};

var placementInSet = function(placement, pArr) {
    for (var i = 0; i < pArr.length; i++) {
        if (pArr[i] == placement)
            return true;
    }
    return false;
}

var labelPointAddToSet = function(lp1, lpArr) {
    if (labelPointInSet(lp1, lpArr)) {
        return false;
    }
    lpArr.push(lp1);
};

var RectShape = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

var objDeepCopy = sharemapdymo.objDeepCopy;
var projectPoint = sharemapdymo.projectPoint;

var Vector = sharemapdymo.Vector;


var LabelPoint = function(name, fontFamily, fontSize, location, position, radius, properties, rank, preferred, extras) {
    this.init(name, fontFamily, fontSize, location, position, radius, properties, rank, preferred, extras);
    //this.hash = Math.round(sharemapdymo.random() * 10000);
};


LabelPoint.IDGENERATOR = 0;

LabelPoint.NE = 0;
LabelPoint.ENE = 1;
LabelPoint.ESE = 2;
LabelPoint.SE = 3;
LabelPoint.SSE = 4;
LabelPoint.S = 5;
LabelPoint.SSW = 6;
LabelPoint.SW = 7;
LabelPoint.WSW = 8;
LabelPoint.WNW = 9;
LabelPoint.NW = 10;
LabelPoint.NNW = 11;
LabelPoint.N = 12;
LabelPoint.NNE = 13;
//
//          NNW   N   NNE
//        NW             NE
//       WNW      .      ENE
//       WSW             ESE
//        SW             SE
//          SSW   S   SSE
//
// slide 13 of http://www.cs.uu.nl/docs/vakken/gd/steven2.pdf
//
LabelPoint.placements = {}
LabelPoint.placements[LabelPoint.NE] = 0.000;
LabelPoint.placements[LabelPoint.ENE] = 0.070;
LabelPoint.placements[LabelPoint.ESE] = 0.100;
LabelPoint.placements[LabelPoint.SE] = 0.175;
LabelPoint.placements[LabelPoint.SSE] = 0.200;
LabelPoint.placements[LabelPoint.S] = 0.900;
LabelPoint.placements[LabelPoint.SSW] = 1.000;
LabelPoint.placements[LabelPoint.SW] = 0.600;
LabelPoint.placements[LabelPoint.WSW] = 0.500;
LabelPoint.placements[LabelPoint.WNW] = 0.470;
LabelPoint.placements[LabelPoint.NW] = 0.400;
LabelPoint.placements[LabelPoint.NNW] = 0.575;
LabelPoint.placements[LabelPoint.N] = 0.800;
LabelPoint.placements[LabelPoint.NNE] = 0.150;
LabelPoint.prototype.init = function(name, fontFamily, fontSize, location, position, radius, properties, rank, preferred, extras) {
    var self = this;
    if (!rank)
        rank = 1;
    if (!preferred)
        preferred = null;
    /*if ((location.lon < -360) || (360 < location.lon)) {
     throw new Exception('Silly human trying to pass an invalid longitude of ' + location.lon + ' for ' + name)
     }
     if ((location.lat < -90) || (90 < location.lat)) {
     throw new Exception('Silly human trying to pass an invalid latitude of ' + location.lat + ' for ' + name)
     }*/
    self._id = "LP_" + (++LabelPoint.IDGENERATOR);
    self._orgId = self._id;
    self.name = name;
    self.location = location;
    self.position = position;
    self.rank = rank;

    self.fontFamily = fontFamily;
    self.fontSize = fontSize;
    self.properties = properties;

    self.placement = LabelPoint.NE;
    self.radius = radius;
    self.buffer = 2;

    self.label_shapes = {}      // dictionary of label bounds by placement
    self.mask_shapes = {}       // dictionary of mask shapes by placement
    self.label_footprint = null  //all possible label shapes, together
    self.mask_footprint = null  // all possible mask shapes, together
    self.point_shape = null     // point shape for current placement
    var full_extras = ((extras) && ((extras.hasOwnProperty('placement'))
            && (extras.hasOwnProperty('label_shapes'))
            && (extras.hasOwnProperty('mask_shapes'))
            && (extras.hasOwnProperty('label_footprint'))
            && (extras.hasOwnProperty('mask_footprint'))
            && (extras.hasOwnProperty('point_shape'))
            && (extras.hasOwnProperty('placements'))
            && (extras.hasOwnProperty('baseline'))));
    if (full_extras) {
        self.placement = extras['placement']
        self.label_shapes = extras['label_shapes']
        self.mask_shapes = extras['mask_shapes']
        self.label_footprint = extras['label_footprint']
        self.mask_footprint = extras['mask_footprint']
        self.point_shape = extras['point_shape']
        self.placements = extras['placements']
        self.baseline = extras['baseline']
    } else {
        self.populatePlacements(preferred)
        self.populateShapes()
    }

    // label bounds for current placement
    self.label_shape = self.label_shapes[self.placement]

    // mask shape for current placement
    self.mask_shape = self.mask_shapes[self.placement]
}

LabelPoint.prototype.hashable = true;

LabelPoint.prototype.includePointInCollission = true;

LabelPoint.prototype.toString = function() {
    var self = this;
    return '<LabelPoint ' + self.name + '>';
}

LabelPoint.prototype.hash = function() {
    var self = this;
    return self.id
}

LabelPoint.prototype.deepCopy = function(objDict) {
    /* Override deep copy to spend less time copying.
     
     Profiling showed that a significant percentage of time was spent
     deep-copying annealer state from step to step, and testing with
     z5 U.S. data shows a 4000% speed increase, so yay.
     */
    var self = this;
    var extras = {placement: self.placement,
        label_shapes: self.label_shapes,
        mask_shapes: self.mask_shapes,
        label_footprint: self.label_footprint,
        mask_footprint: self.mask_footprint,
        point_shape: self.point_shape,
        placements: self.placements,
        baseline: self.baseline};
    var res = new LabelPoint(self.name, self.fontfile, self.fontsize, self.location,
            self.position, self.radius, self.properties, self.rank, null, extras);
    res._orgId = (self.hasOwnProperty("_orgId")) ? self._orgId : self._id;
    return res;
}


LabelPoint.prototype.populateShapes = function() {
    var self = this;
    self.buffer = 0;
    self.radius = 5;
    var point_buffered = Geometry.generateFromPoint(self.position.x, self.position.y, self.radius + self.buffer);
    self.point_shape = Geometry.generateFromPoint(self.position.x, self.position.y, self.radius);
    self.point_shape.name = "point_shape " + self.name;
    var x = self.position.x;
    var y = self.position.y
    var metric = sharemapdymo.TextMeasure.measureText(self.name, self.fontSize, self.fontFamily)
    var w = metric.w;
    var h = metric.h;
    self.baseline = metric.b;

    for (var pKey in LabelPoint.placements) {
        //var pVal = LabelPoint.placements[pKey];
        var placement = pKey;
        var label_shape = this.labelBounds(x, y, w, h, self.radius, placement);
        label_shape.name = "label_shape " + self.name;
        var label_shape_buffered = label_shape.buffer(self.buffer, 2)
        var mask_shape = null;
        if (this.includePointInCollission) {
            mask_shape = label_shape_buffered.union(point_buffered);
        } else {
            mask_shape = label_shape_buffered;
        }
        mask_shape.name = "mask_shape " + self.name;
        self.label_shapes[placement] = label_shape;
        self.mask_shapes[placement] = mask_shape;
    }
    // XXX unionize = lambda a, b: a.union(b)
    self.label_footprint = Geometry.unionGeometries(self.label_shapes);// reduce(unionize, self.label_shapes.values())
    self.label_footprint.name = "label_footprint " + self.name;
    self.mask_footprint = Geometry.unionGeometries(self.mask_shapes); //reduce(unionize, self.mask_shapes.values())
    self.mask_footprint.name = "mask_footprint " + self.name;
};

LabelPoint.prototype.populatePlacements = function(preferred) {
    var self = this;
    // Set values for self.placements.
    //
    // local copy of placement energies
    self.placements = objDeepCopy(LabelPoint.placements)

    // top right is the Imhof-approved default
    if ((!preferred) || (preferred === 'top right')) {
        return
    }
    ;
// bump up the cost of every placement artificially to leave room for new preferences
// XXX self.placements = dict([ (key, .4 + v*.6) for (key, v) in self.placements.items() ])
    var newPlacements = {};
    for (var key in self.placements) {
        newPlacements[key] = 0.4 + self.placements[key] * 0.6;
    }
    self.placements = newPlacements;
    if (preferred === 'top') {
        self.placement = LabelPoint.N;
        var opts = {};
        opts[LabelPoint.N] = 0.0;
        opts[LabelPoint.NNW] = 0.3;
        opts[LabelPoint.NNE] = 0.3;
        self.placements.update(opts);
    } else if (preferred == 'top left') {
        self.placement = LabelPoint.NW
        opts[LabelPoint.NW] = 0.0;
        opts[LabelPoint.WNW] = 0.1;
        opts[LabelPoint.NNW] = 0.1;
        self.placements.update(opts)
    }
    else if (preferred == 'bottom') {
        self.placement = LabelPoint.S;
        opts[LabelPoint.NW] = 0.0;
        opts[LabelPoint.SSW] = 0.3;
        opts[LabelPoint.SSE] = 0.3;
        self.placements.update(opts)
    }
    else if (preferred == 'bottom right') {
        self.placement = LabelPoint.SE
        opts[LabelPoint.SE] = 0.0;
        opts[LabelPoint.ESE] = 0.1;
        opts[LabelPoint.SSE] = 0.1;
        self.placements.update(opts);
    }
    else if (preferred == 'bottom left') {
        self.placement = LabelPoint.SW
        opts[LabelPoint.SW] = 0.0;
        opts[LabelPoint.WSW] = 0.1;
        opts[LabelPoint.SSW] = 0.1;
        self.placements.update(opts)
    }

    else {
        throw new Error("Unknown preferred placement " + preferred)
    }
};

LabelPoint.prototype.text = function(self) {
// Return text content, font file and size.
//}
    var self = this;
    var res = {};
    res.res0 = self.name;
    res.res1 = self.fontfile;
    res.res2 = self.fontsize;
};

LabelPoint.prototype.label = function() {
    var self = this;
    // Return a label polygon, the bounds of the current label shape.
    //
    var res = self.label_shape;
    return  res;
};


LabelPoint.prototype.registration = function() {
// Return a registration point and text justification.
//
    var self = this;
    //xmin, ymin, xmax, ymax = self.label_shape.bounds //TODO : Renable this function
    var xmin;
    var ymin;
    var xmax;
    var ymax;
    var justification;
    var y = ymin + self.baseline;
    var x;
    if (placementInSet(self.placement, [LabelPoint.NNE, LabelPoint.NE, LabelPoint.ENE, LabelPoint.ESE, LabelPoint.SE, LabelPoint.SSE])) {
        x = xmin;
        justification = 'left';
    }
    else if (placementInSet(self.placement, [LabelPoint.S, LabelPoint.N])) {
        x = xmin / 2 + xmax / 2;
        justification = 'center';
    }
    else if (placementInSet(self.placement, [LabelPoint.SSW, LabelPoint.SW, LabelPoint.WSW, LabelPoint.WNW, LabelPoint.NW, LabelPoint.NNW])) {
        x = xmax;
        justification = 'right';
    }

    return {
        x: x,
        y: y,
        justification: justification
    }
}


LabelPoint.prototype.footprint = function() {
    var self = this;
    // Return a footprint polygon, the total coverage of all placements.
    //
    return self.label_footprint
};

LabelPoint.prototype.move = function() {
    var self = this;
    self.placement = choice(self.placements);
    debug("New point placement " + self.name + " = " + self.placement, LEVEL2);
    self.label_shape = self.label_shapes[self.placement];
    self.mask_shape = self.mask_shapes[self.placement];
};


LabelPoint.prototype.placement_energy = function() {
    var self = this;
    var res = self.placements[self.placement];
    return res;
};

LabelPoint.prototype.overlaps = function(other, reflexive) {
    if (reflexive == null) {
        reflexive = false;
    }
    var self = this;
    var otherLabel = other.label();
    var overlaps = self.mask_shape.intersects(otherLabel)

    if (reflexive) {
        overlaps |= other.overlaps(self, false)
    }
    return overlaps
};


LabelPoint.prototype.can_overlap = function(other, reflexive) {
    if (reflexive == null) {
        reflexive = true;
    }
    var self = this;
    var can_overlap = self.mask_footprint.intersects(other.mask_footprint)
    if (reflexive) {
        can_overlap |= other.can_overlap(self, false)
    }
    return can_overlap
};

LabelPoint.prototype.labelBounds = function(orgX, orgY, width, height, radius, placement) {
    var x = orgX;
    var y = orgY;
    if (placementInSet(placement, [LabelPoint.NE, LabelPoint.ENE, LabelPoint.ESE, LabelPoint.SE])) {
// to the right
        x += radius + width / 2;
    }
    if (placementInSet(placement, [LabelPoint.NW, LabelPoint.WNW, LabelPoint.WSW, LabelPoint.SW])) {
// to the left
        x -= radius + width / 2;
    }
    if (placementInSet(placement, [LabelPoint.NW, LabelPoint.NE])) {
// way up high
        y += height / 2;
    }
    if (placementInSet(placement, [LabelPoint.SW, LabelPoint.SE])) {
// way down low
        y -= height / 2;
    }
    if (placementInSet(placement, [LabelPoint.ENE, LabelPoint.WNW])) {
// just a little above
        y += height / 6;
    }
    if (placementInSet(placement, [LabelPoint.ESE, LabelPoint.WSW])) {
// just a little below
        y -= height / 6;
    }
    if (placementInSet(placement, [LabelPoint.NNE, LabelPoint.SSE, LabelPoint.SSW, LabelPoint.NNW])) {
        var _x = radius * Math.cos(Math.PI / 4) + width / 2;
        var _y = radius * Math.sin(Math.PI / 4) + height / 2;

        if (placementInSet(placement, [LabelPoint.NNE, LabelPoint.SSE])) {
            x += _x;
        }
        else {
            x -= _x;
        }
        if (placementInSet(placement, [LabelPoint.SSE, LabelPoint.SSW])) {
            y -= _y;
        }
        else {
            y += _y;
        }
    }
    if (placement == LabelPoint.N) {
// right on top
        y += radius + height / 2;
    }
    if (placement == LabelPoint.S) {
// right on the bottom
        y -= radius + height / 2;
    }
    var x1 = x - width / 2;
    var y1 = y + height / 2;
    var x2 = x + width / 2;
    var y2 = y - height / 2;
    var res = Geometry.generateFromRect(x1, y1, x2, y2);
    res.setColor("red");
    res.setTextLabel(this.name, x1, y1, width, height, this.fontFamily, this.fontSize);
    return res;
};

sharemapdymo.LabelPoint = LabelPoint;




var Places = function() {

    this.init();
};

Places.IDGENERATOR = 0;

Places.prototype.init = function(keep_chain, extras) {
    var self = this;
    self._id = "PL_" + (++Places.IDGENERATOR);
    if (!keep_chain)
        keep_chain = false;
    self.keep_chain = keep_chain

    var full_extras = ((extras)
            && (extras.hasOwnProperty('energy'))
            && (extras.hasOwnProperty('previous'))
            && (extras.hasOwnProperty('places'))
            && (extras.hasOwnProperty('neighbors'))
            && (extras.hasOwnProperty('moveable')));
    if (full_extras) {
        // use the provided extras
        self.energy = extras['energy']
        self.previous = extras['previous']
        self.places = extras['places']
        self.neighbors = extras['neighbors']
        self.moveable = extras['moveable']
    }
    else {
        self.energy = 0.0;
        self.previous = null;

        self.places = []    // core list of places
        self.neighbors = {} // dictionary of neighbor sets
        self.moveable = []  // list of only this places that should be moved
    }
}



Places.prototype.deepCopy = function(objDict) {
    var self = this;
    var extras = {energy: self.energy,
        previous: (self.keep_chain ? self : null),
        places: objDeepCopy(self.places, objDict),
        neighbors: objDeepCopy(self.neighbors, objDict),
        moveable: objDeepCopy(self.moveable, objDict)
    };
    var res = new Places();
    res.init(self.keep_chain, extras);
    return res;
};

Places.prototype.add = function(place) {
    var self = this;
    self.neighbors[place] = [];

    // calculate neighbors
    for (var i = 0; i < self.places.length; i++) {
        var other = self.places[i];
        if (!place.can_overlap(other)) {
            continue
        }
        var overlap_energy = self.overlap_energy(place, other);
        self.energy += overlap_energy;

        labelPointAddToSet(place, self.moveable);
        labelPointAddToSet(other, self.neighbors[place]);
        labelPointAddToSet(place, self.neighbors[other]);

        if (!placementInSet(other, self.moveable)) {
            labelPointAddToSet(other, self.moveable);
        }
    }
    self.energy += place.placement_energy()
    labelPointAddToSet(place, self.places);

    return self.neighbors[place]

};

Places.prototype.overlap_energy = function(_this, _that) {
// Energy of an overlap between two places, if it exists.
//
    var res = 0;
    if (_this.overlaps(_that)) {
        res = Math.min(10.0 / _this.rank, 10.0 / _that.rank);
    }
    return res;
}

Places.prototype.move = function() {
    var self = this;
    if (self.moveable.length === 0) {
        throw new Error('Zero places');
    }
    var place = choice(self.moveable);
    var neighbors = self.neighbors[place];
    var other;
    var overlapEnergy;
    for (var key in neighbors) { //XXX
        other = neighbors[key];
        overlapEnergy = self.overlap_energy(place, other);
        self.energy -= overlapEnergy
    }

    self.energy -= place.placement_energy()

    place.move()

    for (key in neighbors) {
        other = neighbors[key];
        overlapEnergy = self.overlap_energy(place, other);
        self.energy += overlapEnergy;
        //console.log("OVERLAP ENERGY " + place.name + " [" + place.placement + "]" + " vs " + other.name + " [" + other.placement + "] = " + overlapEnergy);
    }
    var placementEnergy = place.placement_energy();
    self.energy += placementEnergy;
    debug("PLACES MOVE ENERGY " + fmtF6(self.energy), LEVEL2);
}

Places.prototype.count = function() {
    var self = this;
    return self.places.length();
}

Places.prototype.hashable = true;


Places.prototype.in_pieces = function() {
    var self = this;

    var partitions = [];
    var partitioned = {};


    var addToPartition = function(place) {
        if (partitioned.hasOwnProperty(place))
            return partitioned[place];
        var partition = [];
        var parents = [];
        var noPop = false;
        do {
            if (!partitioned.hasOwnProperty(neighbor)) {
                partition.push(place);
                partitioned[place] = partition;
            }
            var neighbors = self.neighbors[place];
            noPop = false;
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (!partitioned.hasOwnProperty(neighbor)) {
                    parents.push(place);
                    place = neighbor;
                    noPop = true;
                    break;
                }
            }
            if (noPop == false) {
                place = parents.pop();
            }
        } while (parents.length > 0)
        partitions.push(partition);
        return partition;
    }

    for (var i = 0; i < self.places.length; i++) {
        var place = self.places[i];
        addToPartition(place);
    }
    var pieces = []

    for (var i = 0; i < partitions.length; i++) {
        var partition = partitions[i];
        var places = new Places();
        places.init(self.keep_chain);
        var indexes = [];
        var weight = 0;

        for (var j = 0; j < partition.length; j++)
        {
            var place = partition[j];
            var neighbors = self.neighbors[place];
            places.add(place)
            weight += neighbors.length;
            indexes.push(self.places.indexOf(place));
        }
        pieces.push([places, indexes, weight])
    }
    var total_weight = 0;
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        total_weight += piece[2];
    }
    var newPieces = [];
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        newPieces.push([piece[0], piece[1], piece[2] / 2, total_weight / 2]);
    }
    //total_weight = sum([weight for (p, i, weight) in pieces])
    //    pieces = [(p, i, w / 2, total_weight / 2) for (p, i, w) in pieces]
    //  pieces.sort(key = lambda piece: piece[2], reverse = True)
    newPieces.sort(function(a, b) {
        if (a > b)
            return 1;
        if (a < b)
            return -1;
        return 0;
    });

    //
    // pieces is now a list of tuples, each with an instance of Places,
    // a list of indexes back to self.places (the original collections),
    // and the numerator and denominator of a fractional weight based on
    // connectivity and expected processing time.
    //
    return newPieces;


    /* Partition places into mutually-overlapping collections.
     
     Return value is a list of tuples, each with a Places instance,
     a list of indexes back to the parent Places instance, a weight
     for that instance based on connectivity density, and a total
     weight for all pieces together.
     */
    /*
     partition = [];
     places = self.places[:]; //xxx
     
     while places:
     group, neighbors = [], [places.pop(0)]
     
     while neighbors:
     place = neighbors.pop(0)
     group.append(place)
     
     if place in places:
     // can't be in any other group
     places.remove(place)
     
     for neighbor in self.neighbors[place]:
     if neighbor not in group and neighbor not in neighbors:
     neighbors.append(neighbor)
     
     partition.append(group)
     
     //
     // partition is now a list of lists of places.
     //
     
     pieces = []
     
     for place_list in partition:
     places = Places(self.keep_chain)
     indexes = []
     weight = 0
     
     for place in place_list:
     places.add(place)
     weight += len(self.neighbors[place])
     indexes.append(self.places.index(place))
     
     pieces.append((places, indexes, weight))
     
     total_weight = sum([weight for (p, i, weight) in pieces])
     pieces = [(p, i, w / 2, total_weight / 2) for (p, i, w) in pieces]
     pieces.sort(key = lambda piece: piece[2], reverse = True)
     
     //
     // pieces is now a list of tuples, each with an instance of Places,
     // a list of indexes back to self.places (the original collections),
     // and the numerator and denominator of a fractional weight based on
     // connectivity and expected processing time.
     //
     
     return pieces
     */
}

sharemapdymo.Places = Places;var Annealer = function(energyFunc, moveFunc) {
    this.init(energyFunc, moveFunc);
};

Annealer.prototype.init = function(energyFunc, moveFunc)
{
    this.fakeData = true;//(sharemapdymo.fakeData === true);
    var self = this;
    self.energy = energyFunc;  // function to calculate energy of a state
    self.move = moveFunc;      // function to make a random change to a state
};


Annealer.prototype.anneal = function(state, Tmax, Tmin, steps, updates, logProgress)
{
    var self = this;
    //Tmax = 17; //TODO: Remove this
    debug("anneal: ", [Tmax, Tmin, steps, updates]);
    if (!updates)
        updates = 0;
    if (!logProgress)
        logProgress = false;
    /*Minimizes the energy of a system by simulated annealing.
     
     Keyword arguments:
     state -- an initial arrangement of the system
     Tmax -- maximum temperature (in units of energy)
     Tmin -- minimum temperature (must be greater than zero)
     steps -- the number of steps requested
     updates -- the number of updates to print during annealing
     
     Returns the best state and energy found.*/

    var step = 0;
    var start = time();

    var update = function(T, E, acceptance, improvement)
    {
        var self = this;

        /*Prints the current temperature, energy, acceptance rate,
         improvement rate, elapsed time, and remaining time.
         
         The acceptance rate indicates the percentage of moves since the last
         update that were accepted by the Metropolis algorithm.  It includes
         moves that decreased the energy, moves that left the energy
         unchanged, and moves that increased the energy yet were reached by
         thermal excitation.
         
         The improvement rate indicates the percentage of moves since the
         last update that strictly decreased the energy.  At high
         temperatures it will include both moves that improved the overall
         state and moves that simply undid previously accepted moves that
         increased the energy by thermal excititation.  At low temperatures
         it will tend toward zero as the moves that can decrease the energy
         are exhausted and moves that would increase the energy are no longer
         thermally accessible.*/

        var elapsed = time() - start;
        if (this.fakeData)
            elapsed = 50.1;
        if ((step == 0) && (logProgress))
        {

            debugCols("", ["Temperature", "Energy", "Accept", "Improve", "Elapsed", "Remaining"]);
            debugCols("", [T, E, time_string(elapsed)]);
        }

        else if (step != 0)
        {

            var remain = (steps - step) * (elapsed / step);
            if (logProgress)
            {

                debugCols("", [T, E, 100.0 * acceptance, 100.0 * improvement, time_string(elapsed), time_string(remain)]);
            }
        }
    }




    // Precompute factor for exponential cooling from Tmax to Tmin
    if (Tmin <= 0.0)
    {

        throw new Error('Exponential cooling requires a minimum temperature greater than zero.');
    }

    var Tfactor = -Math.log(float(Tmax) / Tmin);

    // Note initial state
    var T = Tmax;
    var E = self.energy(state, true);
    var prevState = objDeepCopy(state);
    var prevEnergy = E;
    var bestState = objDeepCopy(state);
    var bestEnergy = E;
    var trials = 0;
    var accepts = 0;
    var improves = 0;
	var updateWavelength;
	var dE;
    if (updates > 0)
    {

        updateWavelength = float(steps) / updates;
        update(T, E, null, null);
    }


    // Attempt moves to new states
    while (step < steps)
    {

        step += 1;
        T = Tmax * Math.exp(Tfactor * step / steps);
        self.move(state);
        E = self.energy(state);
        dE = E - prevEnergy;
        trials += 1;
        if ((dE > 0.0) && (Math.exp(-dE / T) < random()))
        {

            // Restore previous state
            state = objDeepCopy(prevState);
            E = prevEnergy;
        }

        else
        {

            // Accept new state and compare to best state
            accepts += 1;
            if (dE < 0.0)
            {

                improves += 1;
            }

            prevState = objDeepCopy(state);
            prevEnergy = E;
            if (E < bestEnergy)
            {

                bestState = objDeepCopy(state);
                bestEnergy = E;
            }
        }

        if (updates > 1)
        {

            if ((Math.floor(step / updateWavelength)) > (Math.floor((step - 1) / updateWavelength)))
            {
                update(T, E, float(accepts) / trials, float(improves) / trials);
                trials = 0;
                accepts = 0;
                improves = 0;
            }

        }
    }
    // Return best state and energy
    return {bestState: bestState, bestEnergy: bestEnergy};
};


Annealer.prototype.auto = function(state, minutes, steps)
{
    var self = this;
    if (!steps) {
        steps = 2000;
    }
    /*Minimizes the energy of a system by simulated annealing with
     automatic selection of the temperature schedule.
     
     Keyword arguments:
     state -- an initial arrangement of the system
     minutes -- time to spend annealing (after exploring temperatures)
     steps -- number of steps to spend on each stage of exploration
     verbose -- boolean, whether to print progress at all
     
     Returns the best state and energy found.*/

    var run = function(state, T, steps)
    {

        /*Anneals a system at constant temperature and returns the state,
         energy, rate of acceptance, and rate of improvement.*/
        var E = self.energy(state);
        var prevState = objDeepCopy(state);
       var prevEnergy = E;
        var accepts = 0;
       var improves = 0;
	   var dE;
        for (var step = 0; step < steps; step++)
        {
            self.move(state);
            E = self.energy(state);
            dE = E - prevEnergy;
            if ((dE > 0.0) && (Math.exp(-dE / T) < random("RP1")))
            {
                state = objDeepCopy(prevState);
                E = prevEnergy;
            } else {

                accepts += 1;
                if (dE < 0.0)
                {

                    improves += 1;
                }
                prevState = objDeepCopy(state);
                prevEnergy = E;
            }
        }
        var res = {
            run1: state,
            run2: E,
            run3: float(accepts) / steps,
            run4: float(improves) / steps
        }
        return res;
    }


    var step = 0;
    var start = time();

    debug('Attempting automatic simulated anneal...');

    // Find an initial guess for temperature
    var T = 0.0;
    var E = self.energy(state);
    while (T == 0.0)
    {
        step += 1;
        self.move(state);
        T = Math.abs(self.energy(state) - E);
    }
    debug("Initial temp:" + fmtF6(T) + ", energy:" + fmtF6(E));
    //throw Error("END");
    debug('Exploring temperature landscape:');
    debugCols("", ["Temperature", "Energy", "Accept", "Improve", "Elapsed"]);
    var update = function(T, E, acceptance, improvement)
    {

        /*Prints the current temperature, energy, acceptance rate,
         improvement rate, and elapsed time.*/
        var elapsed = time() - start;
        if (this.fakeData)
            elapsed = 50.1;
        debugCols("", [T, E, 100.0 * acceptance, 100.0 * improvement, time_string(elapsed)]);
    }


    // Search for Tmax - a temperature that gives 98% acceptance
    var runRes = run(state, T, steps);
    state = runRes.run1;
    E = runRes.run2;
    var acceptance = runRes.run3;
    var improvement = runRes.run4;

    step += steps;
    while (acceptance > 0.98)
    {
        T = round_figures(T / 1.5, 2);
        var runRes2 = run(state, T, steps);
        state = runRes2.run1;
        E = runRes2.run2;
        acceptance = runRes2.run3;
        improvement = runRes2.run4;
        step += steps;
        update(T, E, acceptance, improvement);
    }

    while (acceptance < 0.98)
    {
        T = round_figures(T * 1.5, 2);
        runRes = run(state, T, steps);
        state = runRes.run1;
        E = runRes.run2;
        acceptance = runRes.run3;
        improvement = runRes.run4;
        step += steps;
        update(T, E, acceptance, improvement);
    }

   var Tmax = T;
    debug("Improvement loop");

    // Search for Tmin - a temperature that gives 0% improvement
    while (improvement > 0.0)
    {
        T = round_figures(T / 1.5, 2);
        runRes = run(state, T, steps);
        state = runRes.run1;
        E = runRes.run2;
        acceptance = runRes.run3;
        improvement = runRes.run4;
        step += steps;
        update(T, E, acceptance, improvement);
    }

    var Tmin = T;

    // Calculate anneal duration
    var elapsed = time() - start;
    if (this.fakeData)
        elapsed = 200.1;

   var  duration = round_figures(int(60.0 * minutes * step / elapsed), 2)
    debug('Annealing from ' + Tmax + ' to ' + Tmin + ' over ' + duration + ' steps.');
    return self.anneal(state, Tmax, Tmin, duration, 20, minutes > .3);
}
sharemapdymo.Annealer = Annealer;var Labeler = function() {
}


Labeler.prototype.annealPlacelist = function(places1, indexes, weight, connections, options)
{



    var annealer = this.annealer;
    var res = [];
// Anneal a list of places and return the results.
    if (indexes.length === 1)
    {
        res = generatePlacelistResult(places1, indexes);
        return res;
    }
    //   try

    var start = (new Date()).getTime();
    var minutes = (options.minutes * weight) / connections;
    // minutes = 0.1;
    //    console.log("Annealer params ",places, minutes, Math.min(100, weight * 20));
    //     return;
    var aRes = annealer.auto(places1, minutes, Math.min(1000, weight * 20));
    var annealedPlaces = aRes.bestState;
    var e = aRes.bestEnergy;

    /*
     catch (err)
     {
     console.log(err);
     }
     */
    /* else:
     {
     
     if (minutes > .3)
     {
     
     elapsed = timedelta(seconds = time() - start)
     overtime = elapsed - timedelta(minutes = minutes)
     debug('...done in %s including %s overhead.' % (str(elapsed)[: - 7], str(overtime)[: - 7]))
     }
     }*/


    res = generatePlacelistResult(annealedPlaces, indexes);
    return res;
};

Labeler.prototype.annealInSerial = function(places, options)
{


    if (!options) {
        options = objDeepCopy(Labeler.defaultOptions);
    }


    var energyFunc = function(inpPlaces) {
        return inpPlaces.energy;
    };
    var moveFunc = function(inpPlaces) {
        inpPlaces.move()
    };
    
    var annealer = new Annealer(energyFunc, moveFunc);;
   // annealer.init(annealer,energyFunc, moveFunc);
    annealer.id = "Annealer";
    this.annealer = annealer;
   var annealed = fillArray(places.places.length, null);

    var inPieces = places.in_pieces();
    for (var i = 0; i < inPieces.length; i++)
    {
        var piece = inPieces[i];
        var annealedPlacelist = this.annealPlacelist(piece[0], piece[1], piece[2], piece[3], options);
        for (var j = 0; j < annealedPlacelist.length; j++) {
            var tuple = annealedPlacelist[j];
            var index = tuple[0];
            var point = tuple[1];
            annealed[index] = point;
        }
    }
    return annealed;
}

Labeler.defaultOptions = {
    minutes: 0.1
}

sharemapdymo.Labeler = Labeler;
if (typeof define === 'function' && define.amd) {
// AMD / RequireJS
define([], function () {
return sharemapdymo;
});
} else if (typeof module === 'object' && module.exports) {
// node.js
module.exports = sharemapdymo;
} else {
// Included directly via a <script> tag.
window.opentype = sharemapdymo;
}
})();