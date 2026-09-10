import { Types } from 'mongoose';
import { ActivityEntityType, ActivityLogModel } from '../models/ActivityLog.js';

interface ActivityInput {
  workspaceId: Types.ObjectId | string;
  actorId: Types.ObjectId | string;
  actionType: string;
  entityType: ActivityEntityType;
  entityId?: Types.ObjectId | string;
  entityTitle?: string;
  details?: string;
}

export async function recordActivity(input: ActivityInput): Promise<void> {
  try {
    await ActivityLogModel.create(input);
  } catch (error) {
    console.error('Failed to record activity:', error);
  }
}