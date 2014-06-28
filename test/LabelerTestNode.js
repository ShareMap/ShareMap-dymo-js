var fs = require('fs');
var vm = require('vm');
var sharemapjs = {};
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);
window = {}

includeInThisContext(__dirname + "/./InitSharemapJs.js");
includeInThisContext(__dirname + "/../src/Helper.js");
includeInThisContext(__dirname + "/../src/Geometry.js");
includeInThisContext(__dirname + "/../src/Places.js");
includeInThisContext(__dirname + "/../src/Annealer.js");
includeInThisContext(__dirname + "/../src/Labeler.js");
includeInThisContext(__dirname + "/./LabelerTest.js");
includeInThisContext(__dirname + "/./FakeRandom.js");

runLabelerTest();