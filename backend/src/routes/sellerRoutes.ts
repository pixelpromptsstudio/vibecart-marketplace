import { Router } from 'express';
import {
  registerSeller,
  getMySellerProfile,
  updateMySellerProfile,
  getSellerDashboardStats,
  getPublicSeller,
  verifySeller,
  getAllSellersAdmin,
} from '../controllers/sellerController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/public/:idOrSlug', getPublicSeller);

router.post('/register', authenticateToken, registerSeller);
router.get('/me', authenticateToken, getMySellerProfile);
router.put('/me', authenticateToken, updateMySellerProfile);
router.get('/dashboard', authenticateToken, authorize(['SELLER', 'ADMIN', 'SUPER_ADMIN']), getSellerDashboardStats);

router.get('/admin/all', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), getAllSellersAdmin);
router.patch('/:id/verify', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), verifySeller);

export default router;
