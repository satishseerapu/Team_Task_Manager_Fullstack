const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    // Optional task/project metadata for linking notifications to resources
    meta: {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ organization: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
