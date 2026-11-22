import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateToken, authorize } from '../middleware/auth';
import { publicCacheControl } from '../middleware/security';

const router = Router();

router.get('/', publicCacheControl(120, 600), getCategories);
router.get('/:slug', publicCacheControl(60, 300), getCategoryBySlug);
router.post('/', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), createCategory);
router.put('/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), updateCategory);
router.delete('/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deleteCategory);

export default router;
