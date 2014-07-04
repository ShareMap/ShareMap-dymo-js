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

sharemapdymo.Places = Places;