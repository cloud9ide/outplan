const md5 = require("md5");

export default function fakeSha1(text) {
    return md5(text + fakeSha1.$salt);
}

fakeSha1.$salt = undefined;

fakeSha1.$shimmed = true;