import { Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../middleware/auth';
import { resolveVariantPrice, resolveVariantLabel } from '../utils/helpers';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.product',
      populate: { path: 'sellerId', select: 'storeName slug' },
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    // Recalculate everything strictly on the backend!
    let subtotal = 0;
    let originalSubtotal = 0;
    const computedItems: any[] = [];

    for (const item of cart.items) {
      const product: any = item.product;
      if (!product || !product.active) continue;

      const unitPrice = resolveVariantPrice(product, item.variantId);
      const unitOriginal = Math.max(product.originalPrice || unitPrice, unitPrice);
      const lineSubtotal = unitPrice * item.quantity;
      const lineOriginal = unitOriginal * item.quantity;
      const variantName = resolveVariantLabel(product, item.variantId);

      subtotal += lineSubtotal;
      originalSubtotal += lineOriginal;

      computedItems.push({
        _id: item._id,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        variantId: item.variantId,
        variantName,
        unitPrice,
        originalPrice: unitOriginal,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        stock: product.stock,
        isOutOfStock: product.stock < item.quantity,
        seller: product.sellerId,
      });
    }

    // Coupon calculation
    let discount = 0;
    let couponDetails = null;

    if (cart.appliedCoupon && cart.appliedCoupon.code) {
      const coupon = await Coupon.findOne({
        code: cart.appliedCoupon.code,
        active: true,
        expiresAt: { $gt: new Date() },
      });

      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountAmount) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(subtotal, coupon.discountAmount);
        }
        couponDetails = {
          code: coupon.code,
          description: coupon.description,
          discountAmount: discount,
        };
      } else {
        // Coupon invalidated (e.g. subtotal dropped below min requirement)
        cart.appliedCoupon = undefined;
        await cart.save();
      }
    }

    // Free delivery over 499, otherwise 49
    const shippingFee = subtotal === 0 || subtotal >= 499 ? 0 : 49;
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);
    const savings = originalSubtotal - subtotal + discount;

    res.json({
      success: true,
      cart: {
        items: computedItems,
        itemCount: computedItems.reduce((acc, it) => acc + it.quantity, 0),
        subtotal,
        originalSubtotal,
        discount,
        shippingFee,
        totalAmount,
        savings,
        coupon: couponDetails,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      res.status(404).json({ success: false, message: 'Product is unavailable or inactive.' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock.`,
      });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variantId === variantId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        res.status(400).json({
          success: false,
          message: `Cannot add more. Reached maximum available stock of ${product.stock}.`,
        });
        return;
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: product._id as any,
        variantId,
        quantity: Number(quantity),
        addedAt: new Date(),
      });
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Item added to cart.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    const item = cart.items.find((it) => it._id && it._id.toString() === itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not in cart.' });
      return;
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      cart.items = cart.items.filter((it) => it._id && it._id.toString() !== itemId);
    } else {
      const product = await Product.findById(item.product);
      if (product && qty > product.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock.`,
        });
        return;
      }
      item.quantity = qty;
    }

    await cart.save();
    res.json({ success: true, message: 'Cart updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    cart.items = cart.items.filter((it) => it._id && it._id.toString() !== itemId);
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const applyCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
      return;
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty.' });
      return;
    }

    let subtotal = 0;
    for (const item of cart.items) {
      const p: any = item.product;
      if (p) subtotal += p.price * item.quantity;
    }

    if (subtotal < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `This coupon requires a minimum purchase amount of ₹${coupon.minOrderValue}.`,
      });
      return;
    }

    cart.appliedCoupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
    };

    await cart.save();

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.appliedCoupon = undefined;
      await cart.save();
    }

    res.json({ success: true, message: 'Coupon removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], appliedCoupon: undefined });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
