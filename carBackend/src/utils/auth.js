require('dotenv').config();
const jwt = require('jsonwebtoken');

const signInToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};
const isAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }
    const token = authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid token format.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Unauthorized: ' + error.message });
  }
};

module.exports = {
  signInToken,
  isAuth,
};
