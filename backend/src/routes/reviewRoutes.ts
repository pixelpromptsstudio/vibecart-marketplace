import { Router } from 'express';
import { getProductReviews, addProductReview } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', authenticateToken, addProductReview);

export default router;
