ShareMap-dymo-js
================

ShareMap-dymo-js is a port of Dymo (https://github.com/migurski/Dymo)  Python library created by Mike Migurski to JavaScript / ActionScript 3. 

The library is intended to be runnable in 4 enviroments:
* Browser client side
* Node.js server side
* Flash/AIR client side / mobile
* Java enviroment, using Nashorn in Java 8 and Rhino in older Java releases.

Right now the the best test enviroment are first two one but the latter two are also developed and benchmark will be published soon.

In the later plans this library will be enabled to be flawlessly integrated with D3 and LeafLet.

Code cleanup 
================
This library was created with semi-automatic code conversion from Python, therefore some code constructions and variable names may not be typical for JS world. Improvements are implemented gradually, if you think that some part of code generates significant performance degradation please report and issue.

Thanks
================
Very big help for Hugo Lopez from WikiMedia Atlas for guiding us into Dymo.
This project is conducted under  [ShareMap project](http://sharemap.org/) umbrella.
