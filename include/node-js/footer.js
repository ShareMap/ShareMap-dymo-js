if (typeof define === 'function' && define.amd) {
// AMD / RequireJS
define([], function () {
return sharemapdymo;
});
} else if (typeof module === 'object' && module.exports) {
// node.js
module.exports = sharemapdymo;
} else {
// Included directly via a <script> tag.
window.opentype = sharemapdymo;
}
})();