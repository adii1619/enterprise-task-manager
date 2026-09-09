import { Schema, model, Document, Types } from 'mongoose';

export interface IColumn extends Document {
  userId: Types.ObjectId;
  boardId: Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt:Date;
}

const columnSchema = new Schema<IColumn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: false },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const ColumnModel = model<IColumn>('Column', columnSchema);