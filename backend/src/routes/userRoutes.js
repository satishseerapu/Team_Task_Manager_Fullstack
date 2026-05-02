const express = require('express');
const { body, param } = require('express-validator');
const { getOrgUsers, createUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', adminOnly, getOrgUsers);

router.post(
  '/',
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['Admin', 'Member'])
      .withMessage('Role must be Admin or Member'),
  ],
  validate,
  createUser
);

router.patch(
  '/:id/role',
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role')
      .isIn(['Admin', 'Member'])
      .withMessage('Role must be Admin or Member'),
  ],
  validate,
  updateUserRole
);

router.delete(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  deleteUser
);

module.exports = router;
