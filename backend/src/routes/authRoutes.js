const express = require('express');
const { body } = require('express-validator');
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    // organizationName is required only when creating a new org (no organizationId)
    body('organizationName')
      .if(body('organizationId').not().exists())
      .trim()
      .notEmpty()
      .withMessage('organizationName is required for new organization signup'),
    // organizationId must be a valid MongoId if provided
    body('organizationId')
      .optional()
      .isMongoId()
      .withMessage('organizationId must be a valid ID'),
    // role is intentionally NOT validated here — server enforces it
  ],
  validate,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

router.patch(
  '/me',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('currentPassword').optional().notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .optional()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  updateProfile
);

module.exports = router;
