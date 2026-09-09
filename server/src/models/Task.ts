import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  workspaceId: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const TaskModel = model<ITask>('Task', taskSchema);