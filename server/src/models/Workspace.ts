import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceMember {
  userId: mongoose.Types.ObjectId;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['OWNER', 'ADMIN', 'MEMBER'],
          default: 'MEMBER',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Workspace =
  mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', workspaceSchema);

export default Workspace;
