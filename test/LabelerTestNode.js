var fs = require('fs');
var vm = require('vm');
var sharemapjs = {};
var saveFile = 
fs.writeFile(__dirname + "/../tmp/node_output.svg", "Hey there!", function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);
window = {}
includeInThisContext(__dirname + "/./USz6.js");
includeInThisContext(__dirname + "/./USz3.js");
includeInThisContext(__dirname + "/./InitSharemapJs.js");
includeInThisContext(__dirname + "/../src/Helper.js");
includeInThisContext(__dirname + "/../src/Geometry.js");
includeInThisContext(__dirname + "/../src/Places.js");
includeInThisContext(__dirname + "/../src/Annealer.js");
includeInThisContext(__dirname + "/../src/Labeler.js");
includeInThisContext(__dirname + "/./LabelerTest.js");
includeInThisContext(__dirname + "/./FakeRandom.js");
window.saveFile = 
runLabelerTest();