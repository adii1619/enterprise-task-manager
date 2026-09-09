import type { IUser } from '../models/User.js';
import type { IWorkspace } from '../models/Workspace.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      workspace?: IWorkspace;
    }
  }
}

export {};
