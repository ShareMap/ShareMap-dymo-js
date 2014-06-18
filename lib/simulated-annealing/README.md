https://github.com/perrygeo/python-simulated-annealing

This module performs simulated annealing to find a state of a system that
minimizes its energy.
An example program demonstrates simulated annealing with a traveling
salesman problem to find the shortest route to visit the twenty largest
cities in the United States.
 
How to optimize a system with simulated annealing:

1) Define a format for describing the state of the system.

2) Define a function to calculate the energy of a state.

3) Define a function to make a random change to a state.

4) Choose a maximum temperature, minimum temperature, and number of steps.

5) Set the annealer to work with your state and functions.

6) Study the variation in energy with temperature and duration to find a
productive annealing schedule.

Or,

4) Run the automatic annealer which will attempt to choose reasonable values
for maximum and minimum temperatures and then anneal for the allotted time.