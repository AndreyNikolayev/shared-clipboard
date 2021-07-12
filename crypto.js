const pbkdf2 = require('pbkdf2');
const aesjs = require('aes-js');

var key = pbkdf2.pbkdf2Sync(process.env.PASSWORD, 'djnogkmfnthrg', 1, 128 / 8, 'sha512');

class Crypto {
    encrypt(value) {
        var textBytes = aesjs.utils.utf8.toBytes(value);
        var aesCtr = new aesjs.ModeOfOperation.ctr(key);
        var encryptedBytes = aesCtr.encrypt(textBytes);
        return aesjs.utils.hex.fromBytes(encryptedBytes);
    }

    decrypt(value) {
        var encryptedBytes = aesjs.utils.hex.toBytes(value);
        var aesCtr = new aesjs.ModeOfOperation.ctr(key);
        var decryptedBytes = aesCtr.decrypt(encryptedBytes);
        
        return aesjs.utils.utf8.fromBytes(decryptedBytes);
    }
}

module.exports = new Crypto();