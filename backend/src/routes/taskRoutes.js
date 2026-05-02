const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createTask,
  getTasksByProject,
  getTaskById,
  assignTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'Done'])
      .withMessage('Status must be To Do, In Progress, or Done'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    body('projectId').isMongoId().withMessage('Valid project ID is required'),
    body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  ],
  validate,
  createTask
);

router.get(
  '/project/:projectId',
  [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    query('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'Done'])
      .withMessage('Invalid status filter'),
    query('assignedTo').optional().isMongoId().withMessage('Invalid user ID filter'),
  ],
  validate,
  getTasksByProject
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  validate,
  getTaskById
);

router.patch(
  '/:id/assign',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('assignedTo')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('Invalid user ID'),
  ],
  validate,
  assignTask
);

router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('status')
      .isIn(['To Do', 'In Progress', 'Done'])
      .withMessage('Status must be To Do, In Progress, or Done'),
  ],
  validate,
  updateTaskStatus
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('dueDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Invalid date format'),
  ],
  validate,
  updateTask
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  validate,
  deleteTask
);

module.exports = router;
