import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceMember } from '../middleware/workspaceMiddleware.js';
import { getWorkspaceMetrics } from '../controllers/analyticsController.js';

const router = Router();

router.use(protect);
router.get('/:workspaceId/metrics', requireWorkspaceMember, getWorkspaceMetrics);

export default router;
