import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';

export const getActiveCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({
      active: true,
      expiresAt: { $gt: new Date() },
    }).select('-usedCount');

    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllCouponsAdmin = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      minOrderValue,
      maxDiscount,
      expiresAt,
      usageLimit,
    } = req.body;

    if (!code || !description || !discountType || !discountAmount || !expiresAt) {
      res.status(400).json({ success: false, message: 'All required coupon fields must be provided.' });
      return;
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'Coupon code already exists.' });
      return;
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountAmount: Number(discountAmount),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiresAt: new Date(expiresAt),
      usageLimit: Number(usageLimit || 1000),
    });

    await recordAuditLog(req, 'CREATE_COUPON', 'Coupon', coupon._id.toString(), { code });

    res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }

    await recordAuditLog(req, 'DELETE_COUPON', 'Coupon', id, { code: coupon.code });
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
