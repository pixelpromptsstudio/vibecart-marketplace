import { Response } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { Seller } from '../models/Seller';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';
import { paymentService } from '../services/paymentService';
import { resolveVariantPrice, resolveVariantLabel, escapeRegex, parsePositiveInt } from '../utils/helpers';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { shippingAddress, paymentMethod = 'COD', paymentDetails } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
      return;
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty.' });
      return;
    }

    // Recalculate price server-side and validate inventory
    let subtotal = 0;
    const orderItems: any[] = [];
    const productsToUpdateStock: { product: any; quantity: number }[] = [];

    for (const item of cart.items) {
      const product: any = item.product;
      if (!product || !product.active) {
        res.status(400).json({
          success: false,
          message: `Item "${product?.name || 'A product'}" is no longer available.`,
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
        return;
      }

      const unitPrice = resolveVariantPrice(product, item.variantId);
      const lineSubtotal = unitPrice * item.quantity;
      subtotal += lineSubtotal;

      orderItems.push({
        product: product._id,
        seller: product.sellerId,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        variant: resolveVariantLabel(product, item.variantId) || item.variantId,
        price: unitPrice,
        quantity: item.quantity,
        subtotal: lineSubtotal,
      });

      productsToUpdateStock.push({ product, quantity: item.quantity });
    }

    // Coupon discount server-side verification
    let discount = 0;
    let couponCode = undefined;
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
        couponCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const shippingFee = subtotal >= 499 ? 0 : 49;
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    // Verify online payment if provided
    let paymentStatus: 'PENDING' | 'PAID' = paymentMethod === 'COD' ? 'PENDING' : 'PAID';
    let transactionId = `TXN-${Date.now()}`;

    if (paymentMethod !== 'COD' && paymentDetails) {
      const { gatewayOrderId, paymentId, signature } = paymentDetails;
      if (signature) {
        const isValid = paymentService.verifyPaymentSignature(gatewayOrderId, paymentId, signature);
        if (!isValid) {
          res.status(400).json({ success: false, message: 'Payment verification failed.' });
          return;
        }
        transactionId = paymentId || transactionId;
        paymentStatus = 'PAID';
      }
    }

    // Deduct stock
    for (const item of productsToUpdateStock) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    const orderNumber = `VB-${new Date().getFullYear()}${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const initialStatus: OrderStatus = paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING';

    const order = await Order.create({
      orderNumber,
      customerId: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: paymentStatus,
        transactionId,
        paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
      },
      subtotal,
      shippingFee,
      discount,
      totalAmount,
      couponCode,
      status: initialStatus,
      timeline: [
        {
          status: initialStatus,
          timestamp: new Date(),
          note:
            paymentMethod === 'COD'
              ? 'Order placed with Cash on Delivery.'
              : 'Payment successful and order confirmed.',
        },
      ],
      estimatedDelivery,
    });

    // Clear cart
    cart.items = [];
    cart.appliedCoupon = undefined;
    await cart.save();

    await recordAuditLog(req, 'CREATE_ORDER', 'Order', order._id.toString(), {
      orderNumber,
      totalAmount,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const orders = await Order.find({ customerId: req.user.id })
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    const order = await Order.findOne(
      isObjectId ? { _id: id } : { orderNumber: id }
    )
      .populate('items.product', 'name slug images brand')
      .populate('items.seller', 'storeName slug')
      .populate('customerId', 'name email phone');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const customerIdStr =
      (order.customerId as any)?._id?.toString() || order.customerId?.toString();

    if (req.user.role === 'CUSTOMER' && customerIdStr !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    if (req.user.role === 'SELLER') {
      const seller = await Seller.findOne({ userId: req.user.id });
      const ownsOrderItem =
        seller &&
        order.items.some(
          (item: any) =>
            (item.seller?._id?.toString() || item.seller?.toString()) ===
            seller._id.toString()
        );
      if (!ownsOrderItem && customerIdStr !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied to this order.' });
        return;
      }
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (req.user.role === 'SELLER') {
      const seller = await Seller.findOne({ userId: req.user.id });
      const ownsItem =
        seller && order.items.some((item: any) => item.seller.toString() === seller._id.toString());
      if (!ownsItem && order.customerId.toString() !== req.user.id) {
        res.status(403).json({ success: false, message: 'Unauthorized to cancel this order.' });
        return;
      }
    }

    if (
      req.user.role === 'CUSTOMER' &&
      order.customerId.toString() !== req.user.id
    ) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in its current state: ${order.status}.`,
      });
      return;
    }

    order.status = 'CANCELLED';
    order.timeline.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: reason || `Cancelled by ${req.user.name} (${req.user.role}).`,
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    await recordAuditLog(req, 'CANCEL_ORDER', 'Order', order._id.toString(), {
      orderNumber: order.orderNumber,
      reason,
    });

    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSellerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      res.status(403).json({ success: false, message: 'No registered seller store found.' });
      return;
    }

    const orders = await Order.find({ 'items.seller': seller._id })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
      'REFUNDED',
    ];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid order status value.' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (req.user.role === 'SELLER') {
      const seller = await Seller.findOne({ userId: req.user.id });
      const ownsItem =
        seller && order.items.some((item: any) => item.seller.toString() === seller._id.toString());
      if (!ownsItem) {
        res.status(403).json({ success: false, message: 'Unauthorized to update this order.' });
        return;
      }
    }

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by ${req.user.name}.`,
    });

    if (status === 'DELIVERED') {
      order.paymentInfo.status = 'PAID';
      order.paymentInfo.paidAt = new Date();
    }

    await order.save();

    await recordAuditLog(req, 'UPDATE_ORDER_STATUS', 'Order', order._id.toString(), {
      status,
      orderNumber: order.orderNumber,
    });

    res.json({ success: true, message: `Order status changed to ${status}.`, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllOrdersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = String(status).toUpperCase();
    }

    if (search && String(search).trim()) {
      const safeSearch = escapeRegex(String(search).trim());
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: safeSearch, $options: 'i' } },
          { email: { $regex: safeSearch, $options: 'i' } },
        ],
      }).select('_id');

      const orConditions: any[] = [
        { orderNumber: { $regex: safeSearch, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: safeSearch, $options: 'i' } },
        { 'shippingAddress.city': { $regex: safeSearch, $options: 'i' } },
      ];
      if (matchingUsers.length > 0) {
        orConditions.push({ customerId: { $in: matchingUsers.map((u) => u._id) } });
      }
      query.$or = orConditions;
    }

    const pageNum = parsePositiveInt(page, 1, 10000);
    const limitNum = parsePositiveInt(limit, 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total, groupedCounts] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'name email')
        .populate('items.seller', 'storeName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const statusCounts: Record<string, number> = {
      ALL: 0,
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      RETURN_REQUESTED: 0,
      RETURNED: 0,
      REFUNDED: 0,
    };

    for (const row of groupedCounts) {
      if (row._id && typeof row.count === 'number') {
        statusCounts[row._id] = row.count;
        statusCounts.ALL += row.count;
      }
    }

    res.json({
      success: true,
      orders,
      statusCounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
