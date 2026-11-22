import { Router } from 'express';
import {
  getAnalytics,
  getUsers,
  updateUserRole,
  getAuditLogs,
  moderateProduct,
  getAdminProducts,
} from '../controllers/adminController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/analytics', authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), getAnalytics);
router.get('/users', authorize(['ADMIN', 'SUPER_ADMIN']), getUsers);
router.patch('/users/:id/role', authorize(['SUPER_ADMIN']), updateUserRole);
router.get('/logs', authorize(['ADMIN', 'SUPER_ADMIN']), getAuditLogs);
router.get('/products', authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), getAdminProducts);
router.patch('/products/:id/moderate', authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), moderateProduct);

export default router;
