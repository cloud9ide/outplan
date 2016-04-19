var hash = require("string-hash");

module.exports = function(text) {
    return String(hash(text));
};

module.exports.$shimmed = true;