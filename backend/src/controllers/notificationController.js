const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/notifications
 * Returns all notifications for the logged-in user within their organization.
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      organization: req.user.organization,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, 200, 'Notifications fetched successfully.', { notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read (must belong to requesting user).
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
      organization: req.user.organization,
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 200, 'Notification marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all unread notifications as read for the logged-in user.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, organization: req.user.organization, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
