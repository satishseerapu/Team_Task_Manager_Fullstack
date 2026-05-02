const User = require('../models/User');
const Organization = require('../models/Organization');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/auth/signup
 * Creates a new organization and its Admin user. Organization names must be unique.
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, organizationName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'Email is already registered.');
    }

    if (!organizationName || !organizationName.trim()) {
      return sendError(res, 400, 'Organization name is required.');
    }

    const existingOrg = await Organization.findOne({ name: organizationName.trim() });
    if (existingOrg) {
      return sendError(res, 409, 'An organization with this name already exists.');
    }

    const organization = await Organization.create({ name: organizationName.trim() });
    const assignedRole = 'Admin';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      organization: organization._id,
    });

    // Link org back to its creator (only for the Admin/first-user case)
    if (assignedRole === 'Admin') {
      organization.createdBy = user._id;
      await organization.save();
    }

    const token = generateToken(user._id, organization._id);

    return sendSuccess(res, 201, 'Account created successfully.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: organization._id,
          name: organization.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select('+password')
      .populate('organization', 'name');

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user._id, user.organization._id);

    return sendSuccess(res, 200, 'Login successful.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: user.organization._id,
          name: user.organization.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'User fetched successfully.', {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        organization: req.user.organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/me
 * Authenticated user updates their own name and/or password.
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (name) {
      user.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 400, 'Current password is required to set a new password.');
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 401, 'Current password is incorrect.');
      }
      user.password = newPassword;
    }

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully.', {
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

module.exports = { signup, login, getMe, updateProfile };
