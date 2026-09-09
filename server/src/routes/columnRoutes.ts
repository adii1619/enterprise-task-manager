import { Router } from 'express';
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
} from '../controllers/columnController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceMember } from '../middleware/workspaceMiddleware.js';

const router = Router();

router.use(protect);
router.use(requireWorkspaceMember);
router.get('/', getColumns);
router.post('/', createColumn);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);

export default router;