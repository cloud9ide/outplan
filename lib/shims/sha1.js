var hash = require("md5");

module.exports = function(text) {
    return hash(text + this.$salt);
};

module.exports.$salt = "salt";

module.exports.$shimmed = true;