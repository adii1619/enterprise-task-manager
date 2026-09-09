import { Request, Response } from 'express';
import { ColumnModel } from '../models/Column.js';
import { TaskModel } from '../models/Task.js';

// Get all tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!req.workspace) {
      res.status(400).json({ message: 'Workspace context is required' });
      return;
    }

    const tasks = await TaskModel.find({ workspaceId: req.workspace._id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create new task
export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!req.workspace) {
      res.status(400).json({ message: 'Workspace context is required' });
      return;
    }

    const { columnId, title, description, priority, assigneeId } = req.body;
    const column = await ColumnModel.findOne({
      _id: columnId,
      workspaceId: req.workspace._id,
    });

    if (!column) {
      res.status(404).json({ message: 'Column not found' });
      return;
    }

    const task = await TaskModel.create({
      workspaceId: req.workspace._id,
      columnId,
      title,
      description,
      priority,
      assigneeId,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Update task (move columns, change status/title)
export const updateTask = async (req: Request, res: Response) => {
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
    const { columnId, title, description, priority, assigneeId } = req.body;
    if (columnId) {
      const column = await ColumnModel.findOne({
        _id: columnId,
        workspaceId: req.workspace._id,
      });

      if (!column) {
        res.status(404).json({ message: 'Column not found' });
        return;
      }
    }

    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: id, workspaceId: req.workspace._id },
      { columnId, title, description, priority, assigneeId },
      {
      new: true,
      runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
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
    const deletedTask = await TaskModel.findOneAndDelete({
      _id: id,
      workspaceId: req.workspace._id,
    });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};