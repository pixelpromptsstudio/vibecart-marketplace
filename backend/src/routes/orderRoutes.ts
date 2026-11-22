import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
  getAllOrdersAdmin,
} from '../controllers/orderController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getCustomerOrders);
router.get('/seller/orders', authorize(['SELLER', 'ADMIN', 'SUPER_ADMIN']), getSellerOrders);
router.get('/admin/all', authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']), getAllOrdersAdmin);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.patch('/:id/status', authorize(['SELLER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']), updateOrderStatus);

export default router;
