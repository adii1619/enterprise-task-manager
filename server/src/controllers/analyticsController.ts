import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TaskModel } from '../models/Task.js';

export const getWorkspaceMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.workspace) {
      res.status(400).json({ message: 'Workspace context is required' });
      return;
    }

    const workspaceId = new mongoose.Types.ObjectId(req.workspace._id.toString());
    const now = new Date();
    const [statusAndOverdue, workload] = await Promise.all([
      TaskModel.aggregate([
        { $match: { workspaceId } },
        {
          $facet: {
            byStatus: [
              { $lookup: { from: 'columns', localField: 'columnId', foreignField: '_id', as: 'column' } },
              { $unwind: { path: '$column', preserveNullAndEmptyArrays: true } },
              {
                $group: {
                  _id: { $ifNull: ['$column.title', 'Uncategorized'] },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
            overdue: [
              { $match: { dueDate: { $lt: now } } },
              { $lookup: { from: 'columns', localField: 'columnId', foreignField: '_id', as: 'column' } },
              { $unwind: { path: '$column', preserveNullAndEmptyArrays: true } },
              { $match: { $or: [{ 'column.title': { $exists: false } }, { 'column.title': { $not: /done/i } }] } },
              { $count: 'overdueCount' },
            ],
            completed: [
              { $lookup: { from: 'columns', localField: 'columnId', foreignField: '_id', as: 'column' } },
              { $unwind: { path: '$column', preserveNullAndEmptyArrays: true } },
              { $match: { 'column.title': { $regex: /done/i } } },
              { $count: 'completedCount' },
            ],
            total: [{ $count: 'totalCount' }],
          },
        },
      ]),
      TaskModel.aggregate([
        { $match: { workspaceId } },
        {
          $group: {
            _id: '$assigneeId',
            taskCount: { $sum: 1 },
          },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'assignee' } },
        { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            taskCount: 1,
            name: { $ifNull: ['$assignee.name', 'Unassigned'] },
            email: { $ifNull: ['$assignee.email', ''] },
          },
        },
        { $sort: { taskCount: -1, name: 1 } },
      ]),
    ]);

    res.status(200).json({
      summary: statusAndOverdue[0] || { byStatus: [], overdue: [], completed: [], total: [] },
      workload,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message || 'Failed to compute analytics metrics' });
  }
};
