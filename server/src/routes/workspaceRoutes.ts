import { Router } from 'express';
import {
  addWorkspaceMember,
  createWorkspace,
  getWorkspace,
  getWorkspaces,
  getWorkspaceActivity,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceMember } from '../middleware/workspaceMiddleware.js';

const router = Router();

router.use(protect);
router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:workspaceId/activity', requireWorkspaceMember, getWorkspaceActivity);
router.get('/:id', getWorkspace);
router.post('/:workspaceId/members', requireWorkspaceMember, addWorkspaceMember);

export default router;
