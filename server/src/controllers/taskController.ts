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

    const tasks = await TaskModel.find({ workspaceId: req.workspace._id }).populate(
      'assigneeId',
      'name email avatarUrl'
    );
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
    const normalizedAssigneeId =
      typeof assigneeId === 'object' && assigneeId ? assigneeId._id : assigneeId;
    const column = await ColumnModel.findOne({
      _id: columnId,
      workspaceId: req.workspace._id,
    });

    if (!column) {
      res.status(404).json({ message: 'Column not found' });
      return;
    }

    if (normalizedAssigneeId) {
      const isMember = req.workspace.members.some(
        (member) => member.userId.toString() === normalizedAssigneeId
      );
      if (!isMember) {
        res.status(400).json({ message: 'Assignee must be a workspace member' });
        return;
      }
    }

    const task = await TaskModel.create({
      workspaceId: req.workspace._id,
      columnId,
      title,
      description,
      priority,
      assigneeId: normalizedAssigneeId,
    });
    const populatedTask = await TaskModel.findById(task._id).populate(
      'assigneeId',
      'name email avatarUrl'
    );
    res.status(201).json(populatedTask);
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
    const normalizedAssigneeId =
      typeof assigneeId === 'object' && assigneeId ? assigneeId._id : assigneeId;
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

    if (normalizedAssigneeId) {
      const isMember = req.workspace.members.some(
        (member) => member.userId.toString() === normalizedAssigneeId
      );
      if (!isMember) {
        res.status(400).json({ message: 'Assignee must be a workspace member' });
        return;
      }
    }

    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: id, workspaceId: req.workspace._id },
      { columnId, title, description, priority, assigneeId: normalizedAssigneeId },
      {
      new: true,
      runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const populatedTask = await TaskModel.findById(updatedTask._id).populate(
      'assigneeId',
      'name email avatarUrl'
    );
    res.status(200).json(populatedTask);
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