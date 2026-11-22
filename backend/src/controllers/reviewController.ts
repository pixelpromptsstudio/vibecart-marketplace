import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addProductReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;

    if (!rating || !title || !comment) {
      res.status(400).json({ success: false, message: 'Rating, title, and comment are required.' });
      return;
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Check if user purchased product
    const orderWithProduct = await Order.findOne({
      customerId: req.user.id,
      'items.product': productId,
      status: { $in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'] },
    });

    const verifiedPurchase = Boolean(orderWithProduct);

    // Prevent duplicate review by same user on this product
    const existingReview = await Review.findOne({ productId, userId: req.user.id });
    if (existingReview) {
      res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
      return;
    }

    const review = await Review.create({
      productId,
      userId: req.user.id,
      rating: numericRating,
      title,
      comment,
      images: images || [],
      verifiedPurchase,
    });

    // Recalculate product rating and review count
    const allReviews = await Review.find({ productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = allReviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review,
      productRating: product.rating,
      reviewCount: product.reviewCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
