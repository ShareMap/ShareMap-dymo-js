var TextMeasurePreset = function() {
    this.metrics = {};
    this.metrics['New York'] = {w: 56.000000, h: 10.000000, b: 2.000000};
    this.metrics['Philadelphia'] = {w: 84.000000, h: 13.000000, b: 2.000000};
};

TextMeasurePreset.prototype.init = function(a,b,c) {
};


TextMeasurePreset.prototype.presets = function(showTexts) {

};

TextMeasurePreset.prototype.measureText = function(text, size, font) {
    return this.metrics[text];
};

TextMeasurePreset.prototype.extractFontName = function(fontSrc) {
    var s = fontSrc;
    var ind = s.lastIndexOf("/");
    s = s.substr(ind + 1, s.length);
    s = s.replace(".ttf", "");
    s = s.replace(".otf", "");
    return s;
};


sharemapdymo.TextMeasurePreset=TextMeasurePreset;

