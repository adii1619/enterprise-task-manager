import { Request, Response } from 'express';
import { ColumnModel } from '../models/Column.js';
import { ITaskTag, TaskModel } from '../models/Task.js';
import { emitWorkspaceEvent } from '../socket.js';
import { recordActivity } from '../utils/activityLogger.js';

const DEFAULT_TAG_COLOR = '#64748b';

const normalizeTags = (tags: unknown): ITaskTag[] | undefined => {
  if (!Array.isArray(tags)) {
    return undefined;
  }

  return tags.map((tag) => {
    if (typeof tag === 'string') {
      return { name: tag.trim(), color: DEFAULT_TAG_COLOR };
    }

    if (tag && typeof tag === 'object') {
      const tagObject = tag as { name?: unknown; color?: unknown };
      return {
        name: typeof tagObject.name === 'string' ? tagObject.name.trim() : String(tagObject.name ?? ''),
        color:
          typeof tagObject.color === 'string' && tagObject.color.trim()
            ? tagObject.color.trim()
            : DEFAULT_TAG_COLOR,
      };
    }

    return { name: '', color: DEFAULT_TAG_COLOR };
  });
};

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

    const { columnId, title, description, priority, assigneeId, checklist, dueDate, tags } = req.body;
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
      checklist,
      dueDate,
      tags: normalizeTags(tags),
    });
    const populatedTask = await TaskModel.findById(task._id).populate(
      'assigneeId',
      'name email avatarUrl'
    );
    emitWorkspaceEvent(req.workspace._id.toString(), 'task:created', populatedTask);
    await recordActivity({
      workspaceId: req.workspace._id,
      actorId: req.user._id,
      actionType: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task._id,
      entityTitle: task.title,
    });
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
    const { columnId, title, description, priority, assigneeId, checklist, dueDate, tags } = req.body;
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

    const existingTask = columnId
      ? await TaskModel.findOne({ _id: id, workspaceId: req.workspace._id }).select('columnId')
      : null;

    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: id, workspaceId: req.workspace._id },
      {
        columnId,
        title,
        description,
        priority,
        assigneeId: normalizedAssigneeId,
        checklist,
        dueDate,
        tags: normalizeTags(tags),
      },
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
    const workspaceId = req.workspace._id.toString();
    emitWorkspaceEvent(workspaceId, 'task:updated', populatedTask);
    if (existingTask && columnId && existingTask.columnId.toString() !== columnId) {
      emitWorkspaceEvent(workspaceId, 'task:moved', populatedTask);
      await recordActivity({
        workspaceId: req.workspace._id,
        actorId: req.user._id,
        actionType: 'TASK_MOVED',
        entityType: 'TASK',
        entityId: updatedTask._id,
        entityTitle: updatedTask.title,
      });
    }
    await recordActivity({
      workspaceId: req.workspace._id,
      actorId: req.user._id,
      actionType: 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: updatedTask._id,
      entityTitle: updatedTask.title,
    });
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

    emitWorkspaceEvent(req.workspace._id.toString(), 'task:deleted', { id });
    await recordActivity({
      workspaceId: req.workspace._id,
      actorId: req.user._id,
      actionType: 'TASK_DELETED',
      entityType: 'TASK',
      entityId: deletedTask._id,
      entityTitle: deletedTask.title,
    });
    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};