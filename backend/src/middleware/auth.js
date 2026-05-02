const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

/**
 * Verifies the Bearer JWT and attaches the full user document to req.user.
 * req.user.organization is available to all downstream controllers for org-scoping.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user so role/org changes are reflected immediately
    const user = await User.findById(decoded.id).populate('organization', 'name');
    if (!user) {
      return sendError(res, 401, 'User belonging to this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please log in again.');
    }
    next(error);
  }
};

/**
 * Restricts route to Admin role only. Must run after protect.
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return sendError(res, 403, 'Access denied. Admin privileges required.');
  }
  next();
};

module.exports = { protect, adminOnly };
