// const crypto = require('crypto');
// require('dotenv').config();

// const encrypt = (plainText) => {
//     const cipher = crypto.createCipheriv('aes-128-cbc', process.env.WORKING_KEY, '1234567890123456');
//     let encrypted = cipher.update(plainText, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return encrypted;
// };

// const decrypt = (encryptedText) => {
//     const decipher = crypto.createDecipheriv('aes-128-cbc', process.env.WORKING_KEY, '1234567890123456');
//     let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
// };

// module.exports = { encrypt, decrypt };



const crypto = require('crypto');

// const merchantId = process.env.MERCHANT_ID;
// const accessCode = process.env.ACCESS_CODE;
// const workingKey = process.env.WORKING_KEY;  

// function createCCAAvenuePayload(orderId, amount, name, email) {
//     return `merchant_id=${merchantId}&order_id=${orderId}&currency=INR&amount=${amount}&redirect_url=https://booking.sudarshancars.com/confirmed&cancel_url=https://booking.sudarshancars.com/booking-info&language=EN&billing_name=${name}&billing_email=${email}`;
//     // return `merchant_id=${merchantId}&order_id=${orderId}&currency=INR&amount=${amount}&redirect_url=http://localhost:5173/confirmed&cancel_url=http://localhost:5173/booking-info&language=EN&billing_name=${name}&billing_email=${email}`;
// }
function encrypt(plainText, workingKey) {
    if (!plainText) {
        throw new Error('Plaintext data is missing');
    }
    if (!workingKey) {
        throw new Error('Working key is missing');
    }

    const key = crypto.createHash('md5').update(workingKey).digest("hex").substring(0, 16); // AES-128-CBC requires 16-byte key
    const iv = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]); // 16-byte IV

    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}


module.exports = {
    //  createCCAAvenuePayload,
      encrypt };



