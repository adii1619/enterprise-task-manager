import { Request, Response } from 'express';
import { ColumnModel } from '../models/Column.js';
import { emitWorkspaceEvent } from '../socket.js';
import { recordActivity } from '../utils/activityLogger.js';

// Get all columns ordered by rank
export const getColumns = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!req.workspace) {
      res.status(400).json({ message: 'Workspace context is required' });
      return;
    }

    const columns = await ColumnModel.find({ workspaceId: req.workspace._id }).sort({ order: 1 });
    res.status(200).json(columns);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create a new column
export const createColumn = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!req.workspace) {
      res.status(400).json({ message: 'Workspace context is required' });
      return;
    }

    const { title, order, boardId } = req.body;
    const column = await ColumnModel.create({
      workspaceId: req.workspace._id,
      title,
      order,
      boardId,
    });
    emitWorkspaceEvent(req.workspace._id.toString(), 'column:created', column);
    await recordActivity({
      workspaceId: req.workspace._id,
      actorId: req.user._id,
      actionType: 'COLUMN_CREATED',
      entityType: 'COLUMN',
      entityId: column._id,
      entityTitle: column.title,
    });
    res.status(201).json(column);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Update a column title
export const updateColumn = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!req.workspace) {
      res.status(400).json({ message: 'Workspace context is required' });
      return;
    }

    const { id } = req.params;
    const { title } = req.body;
    const updatedColumn = await ColumnModel.findOneAndUpdate(
      { _id: id, workspaceId: req.workspace._id },
      { title },
      { new: true, runValidators: true }
    );

    if (!updatedColumn) {
      return res.status(404).json({ message: 'Column not found' });
    }

    emitWorkspaceEvent(req.workspace._id.toString(), 'column:updated', updatedColumn);
    await recordActivity({
      workspaceId: req.workspace._id,
      actorId: req.user._id,
      actionType: 'COLUMN_UPDATED',
      entityType: 'COLUMN',
      entityId: updatedColumn._id,
      entityTitle: updatedColumn.title,
    });
    res.status(200).json(updatedColumn);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete a column
export const deleteColumn = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!req.workspace) {
      res.status(400).json({ message: 'Workspace context is required' });
      return;
    }

    const { id } = req.params;
    const deletedColumn = await ColumnModel.findOneAndDelete({
      _id: id,
      workspaceId: req.workspace._id,
    });

    if (!deletedColumn) {
      return res.status(404).json({ message: 'Column not found' });
    }

    emitWorkspaceEvent(req.workspace._id.toString(), 'column:deleted', { id });
    await recordActivity({
      workspaceId: req.workspace._id,
      actorId: req.user._id,
      actionType: 'COLUMN_DELETED',
      entityType: 'COLUMN',
      entityId: deletedColumn._id,
      entityTitle: deletedColumn.title,
    });
    res.status(200).json({ message: 'Column deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};