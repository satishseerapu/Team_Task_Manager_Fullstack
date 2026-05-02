const Project = require('../models/Project');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
      organization: req.user.organization, // org-scope
    });

    await project.populate('createdBy', 'name email role');

    return sendSuccess(res, 201, 'Project created successfully.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects
 * Admin sees all org projects; Member sees only projects they belong to.
 */
const getAllProjects = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'Admin'
        ? { organization: req.user.organization }
        : { organization: req.user.organization, members: req.user._id };

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Projects fetched successfully.', { projects });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    })
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return sendError(res, 404, 'Project not found.');
    }

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (req.user.role !== 'Admin' && !isMember) {
      return sendError(res, 403, 'Access denied. You are not a member of this project.');
    }

    return sendSuccess(res, 200, 'Project fetched successfully.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects/:id/members
 */
const addMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    });
    if (!project) {
      return sendError(res, 404, 'Project not found.');
    }

    if (
      req.user.role !== 'Admin' &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Only the project creator or Admin can add members.');
    }

    // Validate all users exist within the same organization
    const users = await User.find({
      _id: { $in: memberIds },
      organization: req.user.organization,
    });
    if (users.length !== memberIds.length) {
      return sendError(res, 400, 'One or more user IDs are invalid or outside your organization.');
    }

    const existingIds = project.members.map((id) => id.toString());
    const newMembers = memberIds.filter((id) => !existingIds.includes(id));
    project.members.push(...newMembers);
    await project.save();

    await project.populate('members', 'name email role');

    return sendSuccess(res, 200, 'Members added successfully.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id/members
 */
const removeMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    });
    if (!project) {
      return sendError(res, 404, 'Project not found.');
    }

    if (
      req.user.role !== 'Admin' &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Only the project creator or Admin can remove members.');
    }

    project.members = project.members.filter(
      (id) => !memberIds.includes(id.toString())
    );
    await project.save();

    await project.populate('members', 'name email role');

    return sendSuccess(res, 200, 'Members removed successfully.', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id  (Admin only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organization: req.user.organization, // org-scope
    });
    if (!project) {
      return sendError(res, 404, 'Project not found.');
    }

    await project.deleteOne();
    return sendSuccess(res, 200, 'Project deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  addMembers,
  removeMembers,
  deleteProject,
};
