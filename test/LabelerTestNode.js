var fs = require('fs');
var vm = require('vm');
var xmlhttprequest = require('xmlhttprequest');
var sharemapjs = {};
var saveFile = function(content) {
    fs.writeFile(__dirname + "/../tmp/node_output.svg", content, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
}

global.debug  = function(msg){
    console.log(msg);
}

var sharemapdymo = require(__dirname + "/../sharemap-dymo-node.js");
global.sharemapdymo=sharemapdymo;
var USz6 = require(__dirname + "/./USz6.js");
global.USz6=USz6;
var FakeRandom = require(__dirname + "/./FakeRandom.js");
global.fakeRandom=FakeRandom.fakeRandom;
var labelerTest = require(__dirname + "/./LabelerTest.js");
global.saveFile = saveFile;
labelerTest.runLabelerTest();