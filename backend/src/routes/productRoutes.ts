import { Router } from 'express';
import {
  getProducts,
  getTrendingProducts,
  getTodayDeals,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticateToken, authorize } from '../middleware/auth';
import { publicCacheControl } from '../middleware/security';

const router = Router();

router.get('/', publicCacheControl(45, 180), getProducts);
router.get('/trending', publicCacheControl(60, 300), getTrendingProducts);
router.get('/deals', publicCacheControl(60, 300), getTodayDeals);
router.get('/:idOrSlug', publicCacheControl(60, 300), getProductBySlugOrId);

router.post(
  '/',
  authenticateToken,
  authorize(['SELLER', 'ADMIN', 'SUPER_ADMIN']),
  createProduct
);
router.put(
  '/:id',
  authenticateToken,
  authorize(['SELLER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']),
  updateProduct
);
router.delete(
  '/:id',
  authenticateToken,
  authorize(['SELLER', 'ADMIN', 'SUPER_ADMIN']),
  deleteProduct
);

export default router;
