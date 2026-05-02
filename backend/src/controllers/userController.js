const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/users
 * Admin: list all users in their organization.
 */
const getOrgUsers = async (req, res, next) => {
  try {
    const users = await User.find({ organization: req.user.organization })
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Users fetched successfully.', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 * Admin creates a new user (Admin or Member) within the same organization.
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'Email is already registered.');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Member',
      organization: req.user.organization,
    });

    return sendSuccess(res, 201, 'User created successfully.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role
 * Admin promotes or demotes a user within the same organization.
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    // Scope lookup to same organization for security
    const user = await User.findOne({
      _id: req.params.id,
      organization: req.user.organization,
    });

    if (!user) {
      return sendError(res, 404, 'User not found in your organization.');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot change your own role.');
    }

    user.role = role;
    await user.save();

    return sendSuccess(res, 200, 'User role updated successfully.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Admin removes a member from the organization.
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      organization: req.user.organization,
    });

    if (!user) {
      return sendError(res, 404, 'User not found in your organization.');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot remove yourself from the organization.');
    }

    await user.deleteOne();

    return sendSuccess(res, 200, 'User removed from organization successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrgUsers, createUser, updateUserRole, deleteUser };
