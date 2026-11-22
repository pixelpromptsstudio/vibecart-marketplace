import { Router } from 'express';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController';
import { authenticateToken, authorize } from '../middleware/auth';
import { publicCacheControl } from '../middleware/security';

const router = Router();

router.get('/', publicCacheControl(120, 600), getBrands);
router.post('/', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), createBrand);
router.put('/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), updateBrand);
router.delete('/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deleteBrand);

export default router;
