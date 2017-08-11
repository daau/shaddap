const DEFAULT_LENGTH = 6;
const DEFAULT_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomString() {
    var result = '';
    for (var i = DEFAULT_LENGTH; i > 0; --i) result += DEFAULT_CHARS[Math.round(Math.random() * (DEFAULT_CHARS.length - 1))];
    return result;
}

module.exports = randomString;