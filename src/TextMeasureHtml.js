/*
 * Depends on jQuery
 */

var TextMeasureHtml = function() {

};

TextMeasureHtml.prototype.init = function(showTexts) {
    var hideStyle = "max-height:1px; max-width:1px; overflow:none; visibility:hidden";
    if (showTexts !== true) {
        hideStyle = "";
    }
    $("body").append("<div id='TextMeasureDiv' style='" + hideStyle + "'></canvas>");
};

TextMeasureHtml.prototype.measureText = function(text, size, font) {
    var span = document.createElement("span");
    $span = $(span);
    $span.addClass("ruler");
    $span.css("font-size", (size).toString() + "px");
    $span.css("font-family", font);
    $span.html(text);
    var $tmDiv = $("#TextMeasureDiv");
    $tmDiv.append("<br/>");
    $tmDiv.append($span);
    var res = {
        w: $span.width(),
        h: $span.height(),
        b: 0, // TODO: Add baseline support,
        text: text,
        size: size,
        font: font
    }
    return res;
};


