const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT embedding userId and organizationId.
 * organizationId is included so middleware can scope queries without extra DB calls.
 */
const generateToken = (userId, organizationId) => {
  return jwt.sign(
    { id: userId, organizationId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
