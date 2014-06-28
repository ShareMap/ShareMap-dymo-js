
var testAnnealer = function() {
    sharemapjs.fakeData = true;
    sharemapjs.randomProvider = fakeRandom;

    debug("TEST ANNEALER")
    for (var i = 0; i < 100; i++) {
    }

    /*Test annealer with a traveling salesman problem.*/

    // List latitude and longitude (degrees) for the twenty largest U.S. cities
    var cities = {'New York City': [40.72, 74.00], 'Los Angeles': [34.05, 118.25],
        'Chicago': [41.88, 87.63], 'Houston': [29.77, 95.38],
        'Phoenix': [33.45, 112.07], 'Philadelphia': [39.95, 75.17],
        'San Antonio': [29.53, 98.47], 'Dallas': [32.78, 96.80],
        'San Diego': [32.78, 117.15], 'San Jose': [37.30, 121.87],
        'Detroit': [42.33, 83.05], 'San Francisco': [37.78, 122.42],
        'Jacksonville': [30.32, 81.70], 'Indianapolis': [39.78, 86.15],
        'Austin': [30.27, 97.77], 'Columbus': [39.98, 82.98],
        'Fort Worth': [32.75, 97.33], 'Charlotte': [35.23, 80.85],
        'Memphis': [35.12, 89.97], 'Baltimore': [39.28, 76.62]};


    var cities2 = {'New York City': [40.72, 74.00], 'Los Angeles': [34.05, 118.25],
        'Chicago': [41.88, 87.63], 'Houston': [29.77, 95.38],
        'Phoenix': [33.45, 112.07], 'Philadelphia': [39.95, 75.17]};

    var route_energy = function(state, debug)
    {

        /*Calculates the length of the route.*/
        e = 0
        var stateLen = state.length;
        for (var i = 0; i < stateLen; i++)
        {
            var c1 = cities[state[i > 0 ? i - 1 : stateLen - 1]];
            var c2 = cities[state[i]];
            var c1c2Dist = AnnealerHelper.distance(c1, c2)
            e += c1c2Dist;
        }

        return e
    }


    var route_move = function(state)
    {
        var stateLen = state.length;
        /*Swaps two cities in the route.*/
        a = randomInt(0, stateLen - 1)
        b = randomInt(0, stateLen - 1)
        // console.log("A: "+a+" B: "+b + "statelen",stateLen - 1);
        stateSwap = state[a];
        state[a] = state[b];
        state[b] = stateSwap;
    };


    var route_energy = function(state, debug)
    {

        /*Calculates the length of the route.*/
        e = 0
        var stateLen = state.length;
        for (var i = 0; i < stateLen; i++)
        {
            var c1 = cities[state[i > 0 ? i - 1 : stateLen - 1]];
            var c2 = cities[state[i]];
            var c1c2Dist = distance(c1, c2)
            e += c1c2Dist;
        }

        return e
    }

    // Start with the cities listed in random order
    state = objKeys(cities);
    //shuffle(state)
    state.sort();
    ri = 0;
    // Minimize the distance to be traveled by simulated annealing with a
    // manually chosen temperature schedule
    annealer = new Annealer();
    annealer.init(annealer, route_energy, route_move)
    annealerRes = annealer.anneal(annealer, state, 10000000, 0.01, 180 * state.length, 9);
    state = annealerRes.bestState;
    e = annealerRes.bestEnergy;
    /*
     while (state[0] != 'New York City')
     {
     var i1 = state.indexOf('New York City');
     if (i1 != 0) {
     var stateNY = state[i1];
     state[i1] = state[0];
     state[0] = stateNY;
     }
     }*/
    var mr = route_energy(state);
    debug("" + mr + " mile route");
    for (var i = 0; i < state.length; i++)
    {
        var city = state[i];
        debug(city);
    }


    // Minimize the distance to be traveled by simulated annealing with an
    // automatically chosen temperature schedule


    debug("auto");

    var autoRes = annealer.auto(annealer, state, 0.1);
    debug("AUTO FINISHED");
    state = autoRes.bestState;
    e = autoRes.bestEnergy;
    while (state[0] != 'New York City')
    {
        rotateArr(state, 1);
    }

    var mr = route_energy(state);
    debug("" + mr + " mile route");
    
    for (var i = 0; i<state.length; i++){
        var s = state[i];
        debug(s);
    }

    debug("END");
}