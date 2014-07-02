
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
    Vector = sharemapdymo.Vector;
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
    a = randomInt(0, stateLen - 1)
    b = randomInt(0, stateLen - 1)
    stateSwap = state[a];
    state[a] = state[b];
    state[b] = stateSwap;
};
sharemapdymo.route_move = routeMove;


var distance = function(a, b) {
    R = 3963  // radius of Earth (miles)
    lat1 = this.radians(a[0]);
    lon1 = this.radians(a[1]);
    lat2 = this.radians(b[0]);
    lon2 = this.radians(b[1]);
    res = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)) * R;
    return res;
};
sharemapdymo.distance = distance;


random = function(caller) {
    var randProvider;
    if (sharemapdymo.hasOwnProperty("randomProvider")) {
        randomProvider = sharemapdymo.randomProvider;
    } else {
        randomProvider = Math.random;
    }
    var res = randomProvider();
    return res;
};
sharemapdymo.random = random;

randomInt = function(minimum, maximum, caller) {
    var r = random(caller);
    res = Math.floor(r * (maximum - minimum + 1)) + minimum;
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
        for (j = s.length; j < 10; j++) {
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
    for (i = 0; i < len; i++) {
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
    if (!Array.isArray(objArr)) {
        arr = [];
        for (key in objArr) {
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
