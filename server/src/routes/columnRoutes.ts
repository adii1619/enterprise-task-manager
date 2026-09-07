import { Router } from 'express';
import {
  getColumns,
  createColumn,
  deleteColumn,
} from '../controllers/columnController.js';

const router = Router();

router.get('/', getColumns);
router.post('/', createColumn);
router.delete('/:id', deleteColumn);

export default router;