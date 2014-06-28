
//(function() {
//sharemapjs.static.hasProp = {}.hasOwnProperty,
/*    sharemapjs.static.extends = function(child, parent) {
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
sharemapjs.Vector = Vector;
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

sharemapjs.Edge = Edge;
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

sharemapjs.Polygon = Polygon;
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

sharemapjs.Geometry = Geometry;
