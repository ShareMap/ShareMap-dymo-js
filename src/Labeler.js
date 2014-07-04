var Labeler = function() {
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
