import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Seller } from '../models/Seller';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';

export const registerSeller = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const {
      businessName,
      storeName,
      description,
      businessAddress,
      phone,
      bankDetails,
      storeLogo,
    } = req.body;

    if (!businessName || !storeName || !phone) {
      res.status(400).json({
        success: false,
        message: 'Business name, store name, and phone are required.',
      });
      return;
    }

    const existingSeller = await Seller.findOne({ userId: req.user.id });
    if (existingSeller) {
      res.status(409).json({
        success: false,
        message: 'You have already registered a seller profile.',
        seller: existingSeller,
      });
      return;
    }

    const slug = `${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const seller = await Seller.create({
      userId: req.user.id,
      businessName,
      storeName,
      slug,
      description,
      businessAddress,
      phone,
      bankDetails,
      storeLogo,
      verificationStatus: 'APPROVED', // For smooth developer demo or PENDING for moderation
    });

    // Update user role to SELLER if they were CUSTOMER
    if (req.user.role === 'CUSTOMER') {
      await User.findByIdAndUpdate(req.user.id, { role: 'SELLER' });
    }

    await recordAuditLog(req, 'REGISTER_SELLER', 'Seller', seller._id.toString(), {
      storeName,
      businessName,
    });

    res.status(201).json({
      success: true,
      message: 'Seller profile registered successfully!',
      seller,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMySellerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      res.status(404).json({ success: false, message: 'No seller profile found.' });
      return;
    }

    res.json({ success: true, seller });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMySellerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      res.status(404).json({ success: false, message: 'Seller profile not found.' });
      return;
    }

    const {
      businessName,
      storeName,
      description,
      businessAddress,
      phone,
      bankDetails,
      storeLogo,
    } = req.body;

    if (businessName) seller.businessName = businessName;
    if (storeName) seller.storeName = storeName;
    if (description) seller.description = description;
    if (businessAddress) seller.businessAddress = businessAddress;
    if (phone) seller.phone = phone;
    if (bankDetails) seller.bankDetails = bankDetails;
    if (storeLogo) seller.storeLogo = storeLogo;

    await seller.save();

    await recordAuditLog(req, 'UPDATE_SELLER_PROFILE', 'Seller', seller._id.toString(), {
      businessName: seller.businessName,
      storeName: seller.storeName,
      phone: seller.phone,
    });

    res.json({ success: true, message: 'Store profile updated.', seller });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSellerDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller) {
      res.status(404).json({ success: false, message: 'Seller profile not found.' });
      return;
    }

    const [totalProducts, lowStockProducts, orders] = await Promise.all([
      Product.countDocuments({ sellerId: seller._id }),
      Product.countDocuments({ sellerId: seller._id, stock: { $lte: 5 } }),
      Order.find({ 'items.seller': seller._id }),
    ]);

    let totalEarnings = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;

    for (const order of orders) {
      if (['PENDING', 'PROCESSING', 'CONFIRMED'].includes(order.status)) {
        pendingOrders += 1;
      }
      if (order.status === 'DELIVERED') {
        deliveredOrders += 1;
      }

      for (const it of order.items) {
        if (it.seller.toString() === seller._id.toString()) {
          totalEarnings += it.subtotal;
        }
      }
    }

    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStockProducts,
        totalOrders: orders.length,
        pendingOrders,
        deliveredOrders,
        totalEarnings,
        rating: seller.rating,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPublicSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    const seller = await Seller.findOne(
      isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
    );

    if (!seller) {
      res.status(404).json({ success: false, message: 'Seller not found.' });
      return;
    }

    const products = await Product.find({
      sellerId: seller._id,
      active: true,
      approvalStatus: 'APPROVED',
    }).limit(20);

    res.json({ success: true, seller, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifySeller = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid verification status.' });
      return;
    }

    const seller = await Seller.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    );

    if (!seller) {
      res.status(404).json({ success: false, message: 'Seller not found.' });
      return;
    }

    await recordAuditLog(req, 'VERIFY_SELLER', 'Seller', id, { status });

    res.json({ success: true, message: `Seller status updated to ${status}.`, seller });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllSellersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status && status !== 'ALL') {
      query.verificationStatus = status;
    }

    const sellers = await Seller.find(query).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
