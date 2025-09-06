var crypto = require("crypto");

function getKey(workingKey) {
  const keyBuffer = Buffer.from(workingKey, "utf8");
  if (keyBuffer.length > 16) {
    return keyBuffer.slice(0, 16);
  } else if (keyBuffer.length < 16) {
    const paddedKey = Buffer.alloc(16);
    keyBuffer.copy(paddedKey);
    return paddedKey;
  }
  return keyBuffer;
}
exports.encrypt = function (plainText, workingKey) {
  const key = getKey(workingKey);
  const iv = Buffer.alloc(16, 0); 
  let cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decrypt = function (encText, workingKey) {
  const key = getKey(workingKey); 
  const iv = Buffer.alloc(16, 0); 
  let decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decrypted = decipher.update(encText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
