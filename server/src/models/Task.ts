import { Schema, model, Document, Types } from 'mongoose';

export interface IChecklistItem {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface ITaskTag {
  name: string;
  color: string;
}

export interface ITask extends Document {
  workspaceId: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: Types.ObjectId;
  checklist: Types.DocumentArray<IChecklistItem>;
  dueDate?: Date;
  tags: ITaskTag[];
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
    checklist: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          completed: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: (value: Date) => !Number.isNaN(value.getTime()),
        message: 'Due date must be a valid date',
      },
    },
    tags: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          color: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, minimize: false }
);

export const TaskModel = model<ITask>('Task', taskSchema);