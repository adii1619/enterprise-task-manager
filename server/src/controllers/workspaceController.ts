import { Request, Response } from 'express';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { ActivityLogModel } from '../models/ActivityLog.js';
import { recordActivity } from '../utils/activityLogger.js';

const createSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, slug: requestedSlug } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const slug = createSlug(
      typeof requestedSlug === 'string' && requestedSlug.trim()
        ? requestedSlug
        : normalizedName
    );

    if (!normalizedName || !slug) {
      res.status(400).json({ message: 'Workspace name is required' });
      return;
    }

    const workspace = await Workspace.create({
      name: normalizedName,
      slug,
      ownerId: req.user._id,
      members: [{ userId: req.user._id, role: 'OWNER' }],
    });

    await recordActivity({
      workspaceId: workspace._id,
      actorId: req.user._id,
      actionType: 'WORKSPACE_CREATED',
      entityType: 'WORKSPACE',
      entityId: workspace._id,
      entityTitle: workspace.name,
    });

    res.status(201).json(await workspace.populate('members.userId', 'name email avatarUrl'));
  } catch (error) {
    const status = (error as { code?: number }).code === 11000 ? 409 : 400;
    res.status(status).json({ message: 'Unable to create workspace' });
  }
};

export const getWorkspaces = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const workspaces = await Workspace.find({
      $or: [
        { ownerId: req.user._id },
        { 'members.userId': req.user._id },
      ],
    }).populate('members.userId', 'name email avatarUrl').sort({ name: 1 });

    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [
        { ownerId: req.user._id },
        { 'members.userId': req.user._id },
      ],
    }).populate('members.userId', 'name email avatarUrl');

    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    res.status(200).json(workspace);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const addWorkspaceMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.workspace) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const requester = req.workspace.members.find(
      (member) => member.userId.toString() === req.user?._id.toString()
    );
    if (!requester || !['OWNER', 'ADMIN'].includes(requester.role)) {
      res.status(403).json({ message: 'Only workspace owners and admins can invite members' });
      return;
    }

    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
    if (!email) {
      res.status(400).json({ message: 'Member email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'No registered user found with that email' });
      return;
    }

    const alreadyMember = req.workspace.members.some(
      (member) => member.userId.toString() === user._id.toString()
    );
    if (alreadyMember) {
      res.status(409).json({ message: 'User is already a workspace member' });
      return;
    }

    req.workspace.members.push({ userId: user._id, role, joinedAt: new Date() });
    await req.workspace.save();

    await recordActivity({
      workspaceId: req.workspace._id,
      actorId: req.user._id,
      actionType: 'MEMBER_INVITED',
      entityType: 'MEMBER',
      entityId: user._id,
      entityTitle: user.name,
      details: `${user.email} invited as ${role}`,
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      role,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getWorkspaceActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.workspace) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
      : 50;
    const activities = await ActivityLogModel.find({ workspaceId: req.workspace._id })
      .populate('actorId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
