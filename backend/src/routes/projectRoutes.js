const express = require('express');
const { body, param } = require('express-validator');
const {
  createProject,
  getAllProjects,
  getProjectById,
  addMembers,
  removeMembers,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  validate,
  createProject
);

router.get('/', getAllProjects);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  getProjectById
);

router.post(
  '/:id/members',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('memberIds')
      .isArray({ min: 1 })
      .withMessage('memberIds must be a non-empty array'),
    body('memberIds.*').isMongoId().withMessage('Each member ID must be a valid MongoID'),
  ],
  validate,
  addMembers
);

router.delete(
  '/:id/members',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('memberIds')
      .isArray({ min: 1 })
      .withMessage('memberIds must be a non-empty array'),
    body('memberIds.*').isMongoId().withMessage('Each member ID must be a valid MongoID'),
  ],
  validate,
  removeMembers
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  adminOnly,
  deleteProject
);

module.exports = router;
