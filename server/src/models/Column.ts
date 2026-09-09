import { Schema, model, Document, Types } from 'mongoose';

export interface IColumn extends Document {
  workspaceId: Types.ObjectId;
  boardId: Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt:Date;
}

const columnSchema = new Schema<IColumn>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: false },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const ColumnModel = model<IColumn>('Column', columnSchema);