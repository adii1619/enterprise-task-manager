import { Request, Response } from 'express';
import Workspace from '../models/Workspace.js';

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

    res.status(201).json(workspace);
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
    }).sort({ name: 1 });

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
    });

    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    res.status(200).json(workspace);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
