import { Router } from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController';
import { authenticateToken, authorize } from '../middleware/auth';
import { publicCacheControl } from '../middleware/security';

const router = Router();

router.get('/', publicCacheControl(120, 600), getBanners);
router.post('/', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), createBanner);
router.put('/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), updateBanner);
router.delete('/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deleteBanner);

export default router;
