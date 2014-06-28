var Annealer = function(energyFunc, moveFunc) {
    this.init(energyFunc, moveFunc);
};

Annealer.prototype.init = function(energyFunc, moveFunc)
{
    this.fakeData = true;//(sharemapjs.fakeData === true);
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
        E = self.energy(state);
        prevState = objDeepCopy(state);
        prevEnergy = E;
        accepts = 0;
        improves = 0;
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


    step = 0;
    start = time();

    debug('Attempting automatic simulated anneal...');

    // Find an initial guess for temperature
    T = 0.0;
    E = self.energy(state);
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
        elapsed = time() - start;
        if (this.fakeData)
            elapsed = 50.1;
        debugCols("", [T, E, 100.0 * acceptance, 100.0 * improvement, time_string(elapsed)]);
    }


    // Search for Tmax - a temperature that gives 98% acceptance
    runRes = run(state, T, steps);
    state = runRes.run1;
    E = runRes.run2;
    acceptance = runRes.run3;
    improvement = runRes.run4;

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

    Tmax = T;
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

    Tmin = T;

    // Calculate anneal duration
    elapsed = time() - start;
    if (this.fakeData)
        elapsed = 200.1;

    duration = round_figures(int(60.0 * minutes * step / elapsed), 2)
    debug('Annealing from ' + Tmax + ' to ' + Tmin + ' over ' + duration + ' steps.');
    return self.anneal(state, Tmax, Tmin, duration, 20, minutes > .3);
}
sharemapjs.Annealer = Annealer;