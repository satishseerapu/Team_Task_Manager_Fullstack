const express = require('express');
const { param } = require('express-validator');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);

// Must be before /:id/read to avoid "read-all" being treated as a MongoId param
router.patch('/read-all', markAllAsRead);

router.patch(
  '/:id/read',
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  validate,
  markAsRead
);

module.exports = router;
