import _ from 'underscore';
import CryptoJS_SHA1 from 'crypto-js/sha1';

var parseEncryptedFile = function(id) {
  var txt = unescape(encodeURIComponent(id.trim()));
  var sha = CryptoJS_SHA1(txt);
  var byteArray = [];
  for (var i = 0; i < sha.sigBytes; i++) {
    byteArray.push((sha.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
  }
  return byteArray;
};

function xorObfuscatedBlob(obfuscatedResourceArray, prefixLength, xorKey) {
  var deobfuscatedArray = new Uint8Array(obfuscatedResourceArray.length);
  var obfuscatedPrefixArray = obfuscatedResourceArray.slice(0, prefixLength);
  var converter = function(data) {
    return new Blob([data.buffer], {
      type: 'application/octet-stream',
    });
  };
  var deObfuscate = function (bytes) {
    var masklen = xorKey.length;
    for (var i = 0; i < prefixLength; i++) {
      bytes[i] = bytes[i] ^ xorKey[i % masklen];
    }
    var remainderArray = obfuscatedResourceArray.slice(prefixLength);
    deobfuscatedArray.set(obfuscatedPrefixArray);
    deobfuscatedArray.set(remainderArray, obfuscatedPrefixArray.length);
    return converter(deobfuscatedArray);
  }
  return deObfuscate(obfuscatedPrefixArray);
}

const deObfuscateEmbeddedFont = function(obfuscatedResource, id) {
    var prefixLength = 1040;
    var uidHash = parseEncryptedFile(id);
    return xorObfuscatedBlob(obfuscatedResource, prefixLength, uidHash);
}

export default deObfuscateEmbeddedFont;
