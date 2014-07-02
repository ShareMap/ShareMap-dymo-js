/*
 * Depends on OpenType.js
 */

var TextMeasureOpenType = function() {
    this.initializedHandler = null;
    this.fontDir = "../fonts/";
    this.fontArr = [];
    this.mainFont = null;
    this.fontsArrToInit = [];
    this.fonts = {};
};

TextMeasureOpenType.prototype.init = function(fontArr, initializedHandler) {
    this.initializedHandler = initializedHandler;
    this.fontArr = [];
    this.fontsArrToInit = [];
    for (var i = 0; i < fontArr.length; i++) {
        var fontSrc = fontArr[i];
        if (fontSrc.indexOf("/")===-1) fontSrc = this.fontDir+fontSrc;
        this.fontArr.push(fontSrc);
        this.fontsArrToInit.push(fontSrc);
    }
    this.initNextFont();
};

TextMeasureOpenType.prototype.initNextFont = function() {
    for (var i = 0; i < this.fontsArrToInit.length; i++) {
        var fontSrc = this.fontsArrToInit[i];
        if (fontSrc !== null) {
            this.initFont(fontSrc);
            this.fontsArrToInit[i] = null;
            return;
        }
    }
    this.initializedHandler();
}

TextMeasureOpenType.prototype.initFont = function(fontSrc) {
    var that = this;
    opentype.load(fontSrc, function(err, font) {
        var fontName = that.extractFontName(fontSrc);
        if (err) {
            console.log(err);
        } else {
            console.log("Initialized font " + fontName + " [" + fontSrc + "]");
        }
        console.log(that);
        that.fonts[fontName] = font;
        that.initNextFont();
    });
};

TextMeasureOpenType.prototype.extractFontName = function(fontSrc) {
    var s = fontSrc;
    var ind = s.lastIndexOf("/");
    s = s.substr(ind + 1, s.length);
    s = s.replace(".ttf", "");
    s = s.replace(".otf", "");
    return s;
};

TextMeasureOpenType.prototype.measureText = function(text, fontSize, fontSrc) {
    var fontName = this.extractFontName(fontSrc);
    var font = this.fonts[fontName];
    var glyphArr = font.stringToGlyphs(text);
    scale = 1 / font.unitsPerEm * fontSize;
    var width = 0;
    var minY = 1000000;
    var maxY = -1000000;
    for (var i = 0; i < glyphArr.length; i++) {
        var g = glyphArr[i];
        width += g.advanceWidth;
        if (g.yMin < minY)
            minY = g.yMin;
        if (g.yMax > maxY)
            maxY = g.yMax;

    }
    var height = font.ascender + Math.abs(font.descender);
    var w = (width * scale);
    var h = (height * scale);
    var res = {
        w: w,
        h: h,
        b: 0, // TODO: Add baseline support,
        text: text,
        size: fontSize,
        font: fontName
    };
    return res;
};
sharemapdymo.TextMeasureOpenType = TextMeasureOpenType;
sharemapdymo.TextMeasure = new TextMeasureOpenType();
