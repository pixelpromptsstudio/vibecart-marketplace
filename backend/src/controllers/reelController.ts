import { Request, Response } from 'express';
import { Reel } from '../models/Reel';
import { Seller } from '../models/Seller';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';

export const getReels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reels = await Reel.find({ active: true })
      .populate('product', 'name slug price originalPrice discount images rating')
      .populate('seller', 'storeName slug storeLogo')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({ success: true, reels });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { title, description, videoUrl, thumbnailUrl, productId, sellerId } = req.body;

    if (!title || !videoUrl || !thumbnailUrl || !productId) {
      res.status(400).json({
        success: false,
        message: 'Title, videoUrl, thumbnailUrl, and productId are required.',
      });
      return;
    }

    let actualSellerId = sellerId;
    if (req.user.role === 'SELLER') {
      const seller = await Seller.findOne({ userId: req.user.id });
      if (!seller) {
        res.status(403).json({ success: false, message: 'Seller profile required.' });
        return;
      }
      actualSellerId = seller._id;
    }

    const reel = await Reel.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      product: productId,
      seller: actualSellerId,
    });

    await recordAuditLog(req, 'CREATE_REEL', 'Reel', reel._id.toString(), { title });

    res.status(201).json({ success: true, message: 'Reel uploaded successfully!', reel });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const likeReel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reel = await Reel.findByIdAndUpdate(
      id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found.' });
      return;
    }

    res.json({ success: true, likesCount: reel.likesCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const viewReel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Reel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);
    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found.' });
      return;
    }

    await Reel.findByIdAndDelete(id);
    await recordAuditLog(req, 'DELETE_REEL', 'Reel', id, { title: reel.title });

    res.json({ success: true, message: 'Reel deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
