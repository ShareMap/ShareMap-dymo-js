var fs = require('fs');
var vm = require('vm');
var DejaVuSerif = "./fonts/DejaVuSerif.ttf"

var sharemapdymo = require(__dirname + "/../sharemap-dymo-node.js");
console.log(sharemapdymo);
var tmot = new sharemapdymo.TextMeasureOpenType();


function fontsReady() {
    console.log("FONTS READY");
    var m = tmot.measureText("Philadelphia", 12, DejaVuSerif);
    console.log(m);
}

function init() {
    tmot.init([DejaVuSerif], fontsReady);
}

init();