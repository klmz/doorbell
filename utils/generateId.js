function generateId(length, charSet) {
    var result = '';
    if (!charSet) {
        charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }
    var charactersLength = charSet.length;
    for (var i = 0; i < length; i++) {
        result += charSet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = generateId