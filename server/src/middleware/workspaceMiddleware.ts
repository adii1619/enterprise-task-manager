import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';

export const requireWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const workspaceId = req.params.workspaceId || req.header('x-workspace-id');
  if (!workspaceId) {
    res.status(400).json({ message: 'Workspace ID is required' });
    return;
  }

  if (!mongoose.isValidObjectId(workspaceId)) {
    res.status(400).json({ message: 'Invalid workspace ID' });
    return;
  }

  try {
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { ownerId: req.user._id },
        { 'members.userId': req.user._id },
      ],
    });

    if (!workspace) {
      res.status(403).json({ message: 'You are not a member of this workspace' });
      return;
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
