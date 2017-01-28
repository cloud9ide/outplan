var hash = require("md5");

var sha1Override = module.exports = function(text) {
    return hash(text + sha1Override.$salt);
};

sha1Override.$salt = "salt";

sha1Override.$shimmed = true;