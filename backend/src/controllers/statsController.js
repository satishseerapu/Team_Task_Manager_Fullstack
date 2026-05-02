const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/stats/org
 * Admin-only: org-wide aggregate stats for the dashboard.
 */
const getOrgStats = async (req, res, next) => {
  try {
    const orgId = req.user.organization;

    const now = new Date();

    const [totalTasks, totalProjects, totalMembers, tasksByStatus, overdueTasks] = await Promise.all([
      Task.countDocuments({ organization: orgId }),
      Project.countDocuments({ organization: orgId }),
      User.countDocuments({ organization: orgId }),
      Task.aggregate([
        { $match: { organization: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        organization: orgId,
        dueDate: { $lt: now },
        status: { $ne: 'Done' },
      }),
    ]);

    const statusCounts = tasksByStatus.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    return sendSuccess(res, 200, 'Org stats fetched successfully.', {
      totalTasks,
      totalProjects,
      totalMembers,
      overdueTasks,
      statusCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrgStats };
