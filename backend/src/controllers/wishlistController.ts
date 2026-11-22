import { Response } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { AuthRequest } from '../middleware/auth';

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate({
      path: 'products',
      match: { active: true },
      populate: { path: 'sellerId', select: 'storeName slug' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }

    res.json({
      success: true,
      wishlist: wishlist.products,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [product._id as any] });
    } else {
      if (!wishlist.products.includes(product._id as any)) {
        wishlist.products.push(product._id as any);
        await wishlist.save();
      }
    }

    res.json({ success: true, message: 'Product added to wishlist.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
      await wishlist.save();
    }

    res.json({ success: true, message: 'Product removed from wishlist.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const moveToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product || !product.active) {
      res.status(404).json({ success: false, message: 'Product is not available.' });
      return;
    }

    // Add to cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const existing = cart.items.find((item) => item.product.toString() === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({
        product: product._id as any,
        quantity: 1,
        addedAt: new Date(),
      });
    }
    await cart.save();

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
      await wishlist.save();
    }

    res.json({ success: true, message: 'Product moved to cart.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
