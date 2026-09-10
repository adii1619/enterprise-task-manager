import { Document, model, Schema, Types } from 'mongoose';

export type ActivityEntityType = 'TASK' | 'COLUMN' | 'WORKSPACE' | 'MEMBER';

export interface IActivityLog extends Document {
  workspaceId: Types.ObjectId;
  actorId: Types.ObjectId;
  actionType: string;
  entityType: ActivityEntityType;
  entityId?: Types.ObjectId;
  entityTitle?: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: { type: String, required: true, trim: true },
    entityType: {
      type: String,
      enum: ['TASK', 'COLUMN', 'WORKSPACE', 'MEMBER'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId },
    entityTitle: { type: String, trim: true },
    details: { type: String, trim: true },
  },
  { timestamps: true }
);

activityLogSchema.index({ workspaceId: 1, createdAt: -1 });

export const ActivityLogModel = model<IActivityLog>('ActivityLog', activityLogSchema);