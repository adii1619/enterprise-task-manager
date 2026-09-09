import { Router } from 'express';
import {
  createWorkspace,
  getWorkspace,
  getWorkspaces,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspace);

export default router;
