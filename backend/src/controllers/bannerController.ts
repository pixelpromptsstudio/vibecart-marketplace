import { Request, Response } from 'express';
import { Banner } from '../models/Banner';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';
import { pickAllowedFields } from '../utils/helpers';

export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position } = req.query;
    const query: any = { active: true };
    if (position) {
      query.position = position;
    }

    const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, subtitle, badge, image, ctaText, ctaLink, position, sortOrder, bgColor, accentColor } =
      req.body;

    if (!title || !image) {
      res.status(400).json({ success: false, message: 'Title and image are required.' });
      return;
    }

    const banner = await Banner.create({
      title,
      subtitle,
      badge,
      image,
      ctaText: ctaText || 'Shop Now',
      ctaLink: ctaLink || '/search',
      position: position || 'HERO',
      sortOrder: Number(sortOrder || 0),
      bgColor,
      accentColor,
    });

    await recordAuditLog(req, 'CREATE_BANNER', 'Banner', banner._id.toString(), { title, position });

    res.status(201).json({ success: true, banner });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = pickAllowedFields(req.body, [
      'title',
      'subtitle',
      'badge',
      'image',
      'ctaText',
      'ctaLink',
      'position',
      'sortOrder',
      'bgColor',
      'accentColor',
      'active',
    ]);
    const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });
    if (!banner) {
      res.status(404).json({ success: false, message: 'Banner not found.' });
      return;
    }

    await recordAuditLog(req, 'UPDATE_BANNER', 'Banner', id, updates);
    res.json({ success: true, banner });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      res.status(404).json({ success: false, message: 'Banner not found.' });
      return;
    }

    await recordAuditLog(req, 'DELETE_BANNER', 'Banner', id, { title: banner.title });
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
