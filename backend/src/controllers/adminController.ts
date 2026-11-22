import { Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Seller } from '../models/Seller';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';
import { escapeRegex, parsePositiveInt } from '../utils/helpers';

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      orders,
      totalCustomers,
      totalSellers,
      pendingSellers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      Order.find(),
      User.countDocuments({ role: 'CUSTOMER' }),
      Seller.countDocuments({ verificationStatus: 'APPROVED' }),
      Seller.countDocuments({ verificationStatus: 'PENDING' }),
      Product.countDocuments({ active: true }),
      Product.countDocuments({ stock: { $lte: 5 } }),
    ]);

    let totalRevenue = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    const categorySalesMap: Record<string, number> = {};

    for (const order of orders) {
      if (order.status === 'DELIVERED' || order.paymentInfo.status === 'PAID') {
        totalRevenue += order.totalAmount;
      }
      if (['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED'].includes(order.status)) {
        pendingOrders += 1;
      }
      if (order.status === 'DELIVERED') {
        deliveredOrders += 1;
      }
      if (order.status === 'CANCELLED') {
        cancelledOrders += 1;
      }
    }

    // Top selling products
    const topProducts = await Product.find({ active: true })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(5)
      .select('name slug price images rating reviewCount stock');

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        deliveredOrders,
        pendingOrders,
        cancelledOrders,
        totalCustomers,
        totalSellers,
        pendingSellers,
        totalProducts,
        lowStockProducts,
      },
      topProducts,
      recentOrders,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (role && role !== 'ALL') {
      query.role = role;
    }
    if (search) {
      const safeSearch = escapeRegex(String(search).trim());
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const pageNum = parsePositiveInt(page, 1, 10000);
    const limitNum = parsePositiveInt(limit, 20, 100);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
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

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SELLER', 'CUSTOMER'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await recordAuditLog(req, 'UPDATE_USER_ROLE', 'User', id, { newRole: role, targetEmail: user.email });

    res.json({ success: true, message: `Role updated to ${role}.`, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '30' } = req.query;
    const pageNum = parsePositiveInt(page, 1, 10000);
    const limitNum = parsePositiveInt(limit, 30, 100);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      logs,
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

export const moderateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approvalStatus, featured, trending, active } = req.body;

    const updates: any = {};
    if (approvalStatus) updates.approvalStatus = approvalStatus;
    if (typeof featured === 'boolean') updates.featured = featured;
    if (typeof trending === 'boolean') updates.trending = trending;
    if (typeof active === 'boolean') updates.active = active;

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await recordAuditLog(req, 'MODERATE_PRODUCT', 'Product', id, updates);

    res.json({ success: true, message: 'Product updated.', product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, approvalStatus, active, page = '1', limit = '20' } = req.query;
    const query: any = {};

    if (search && String(search).trim()) {
      const safeSearch = escapeRegex(String(search).trim());
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { brand: { $regex: safeSearch, $options: 'i' } },
        { sku: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (approvalStatus && approvalStatus !== 'ALL') {
      query.approvalStatus = String(approvalStatus).toUpperCase();
    }

    if (active === 'true' || active === 'false') {
      query.active = active === 'true';
    }

    const pageNum = parsePositiveInt(page, 1, 10000);
    const limitNum = parsePositiveInt(limit, 20, 100);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('sellerId', 'storeName verificationStatus')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
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
