var hash = require("string-hash");

module.exports = function(text) {
    return String(hash(text + "salt"));
};

module.exports.$shimmed = true;