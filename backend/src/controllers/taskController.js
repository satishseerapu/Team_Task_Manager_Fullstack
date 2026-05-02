const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getSocketId } = require('../socket/socket');
const { sendSuccess, sendError } = require('../utils/response');

const isMemberOfProject = (project, userId) =>
  project.members.some((m) => m.toString() === userId.toString());

/**
 * Saves a notification to DB and emits a real-time Socket.IO event if user is online.
 */
const notifyUser = async (req, { userId, message, taskId, projectId }) => {
  const notification = await Notification.create({
    user: userId,
    message,
    organization: req.user.organization,
    meta: { taskId, projectId },
  });

  const io = req.app.get('io');
  const socketId = getSocketId(userId);

  if (io && socketId) {
    io.to(socketId).emit('taskAssigned', {
      message: notification.message,
      taskId,
      projectId,
    });
  }

  return notification;
};

/**
 * POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, dueDate, priority, projectId, assignedTo } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      organization: req.user.organization, // org-scope
    });
    if (!project) {
      return sendError(res, 404, 'Project not found.');
    }

    if (req.user.role !== 'Admin' && !isMemberOfProject(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project.');
    }

    if (assignedTo) {
      const assignee = await User.findOne({
        _id: assignedTo,
        organization: req.user.organization, // org-scope
      });
      if (!assignee) {
        return sendError(res, 404, 'Assigned user not found.');
      }
      if (!isMemberOfProject(project, assignedTo)) {
        return sendError(res, 400, 'Assigned user is not a member of this project.');
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      priority,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      organization: req.user.organization, // org-scope
    });

    // Notify assigned user if different from creator
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await notifyUser(req, {
        userId: assignedTo,
        message: `You have been assigned a new task: "${task.title}"`,
        taskId: task._id,
        projectId: task.project,
      });
    }

    await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return sendSuccess(res, 201, 'Task created successfully.', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/project/:projectId
 */
const getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      organization: req.user.organization, // org-scope
    });
    if (!project) {
      return sendError(res, 404, 'Project not found.');
    }

    if (req.user.role !== 'Admin' && !isMemberOfProject(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project.');
    }

    const { status, assignedTo } = req.query;
    const filter = {
      project: req.params.projectId,
      organization: req.user.organization, // org-scope
    };
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks fetched successfully.', { tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    })
      .populate('project', 'name members')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    if (req.user.role !== 'Admin' && !isMemberOfProject(task.project, req.user._id)) {
      return sendError(res, 403, 'Access denied.');
    }

    return sendSuccess(res, 200, 'Task fetched successfully.', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tasks/:id/assign
 * Saves notification + emits Socket.IO event on assignment.
 */
const assignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    });
    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    const project = await Project.findOne({
      _id: task.project,
      organization: req.user.organization, // org-scope
    });

    if (
      req.user.role !== 'Admin' &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Only the project creator or Admin can assign tasks.');
    }

    if (assignedTo) {
      const assignee = await User.findOne({
        _id: assignedTo,
        organization: req.user.organization, // org-scope
      });
      if (!assignee) {
        return sendError(res, 404, 'Assigned user not found.');
      }
      if (!isMemberOfProject(project, assignedTo)) {
        return sendError(res, 400, 'Assigned user is not a member of this project.');
      }
    }

    task.assignedTo = assignedTo || null;
    await task.save();

    // Persist notification and emit real-time event to the assignee
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await notifyUser(req, {
        userId: assignedTo,
        message: `You have been assigned a task: "${task.title}"`,
        taskId: task._id,
        projectId: task.project,
      });
    }

    await task.populate('assignedTo', 'name email');

    return sendSuccess(res, 200, 'Task assigned successfully.', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    });
    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    const project = await Project.findOne({
      _id: task.project,
      organization: req.user.organization,
    });
    if (!project) {
      return sendError(res, 404, 'Project not found.');
    }

    if (req.user.role === 'Member') {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return sendError(res, 403, 'Members can only update status of their assigned tasks.');
      }
    } else if (!isMemberOfProject(project, req.user._id)) {
      return sendError(res, 403, 'You are not authorized to update the task status.');
    }

    task.status = status;
    await task.save();

    await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return sendSuccess(res, 200, 'Task status updated successfully.', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    });
    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    const project = await Project.findOne({
      _id: task.project,
      organization: req.user.organization,
    });

    if (req.user.role === 'Member') {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return sendError(res, 403, 'Members can only update their assigned tasks.');
      }
    } else if (
      project.createdBy.toString() !== req.user._id.toString() &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'You do not have permission to update this task.');
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;

    await task.save();

    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return sendSuccess(res, 200, 'Task updated successfully.', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    });
    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    const project = await Project.findOne({
      _id: task.project,
      organization: req.user.organization,
    });

    if (req.user.role === 'Member') {
      return sendError(res, 403, 'Members cannot delete tasks.');
    }

    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'You do not have permission to delete this task.');
    }

    await task.deleteOne();
    return sendSuccess(res, 200, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  assignTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
