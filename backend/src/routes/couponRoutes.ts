import { Router } from 'express';
import {
  getActiveCoupons,
  getAllCouponsAdmin,
  createCoupon,
  deleteCoupon,
} from '../controllers/couponController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getActiveCoupons);
router.get('/admin/all', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), getAllCouponsAdmin);
router.post('/', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), createCoupon);
router.delete('/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deleteCoupon);

export default router;
