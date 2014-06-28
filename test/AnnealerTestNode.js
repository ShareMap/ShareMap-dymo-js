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
includeInThisContext(__dirname + "/../src/Annealer.js");
includeInThisContext(__dirname + "/./AnnealerTest.js");
includeInThisContext(__dirname + "/./FakeRandom.js");

testAnnealer();