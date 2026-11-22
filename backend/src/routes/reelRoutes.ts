import { Router } from 'express';
import {
  getReels,
  createReel,
  likeReel,
  viewReel,
  deleteReel,
} from '../controllers/reelController';
import { authenticateToken, authorize } from '../middleware/auth';
import { publicCacheControl } from '../middleware/security';

const router = Router();

router.get('/', publicCacheControl(60, 300), getReels);
router.post('/:id/like', likeReel);
router.post('/:id/view', viewReel);

router.post(
  '/',
  authenticateToken,
  authorize(['SELLER', 'ADMIN', 'SUPER_ADMIN']),
  createReel
);
router.delete(
  '/:id',
  authenticateToken,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  deleteReel
);

export default router;
