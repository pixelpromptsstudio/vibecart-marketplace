import { Request, Response } from 'express';
import { Brand } from '../models/Brand';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';
import { pickAllowedFields } from '../utils/helpers';

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands = await Brand.find().sort({ featured: -1, productCount: -1, name: 1 });
    res.json({ success: true, brands });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, logo, featured } = req.body;
    if (!name || !logo) {
      res.status(400).json({ success: false, message: 'Brand name and logo are required.' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await Brand.findOne({ slug });
    if (existing) {
      res.status(409).json({ success: false, message: 'Brand already exists.' });
      return;
    }

    const brand = await Brand.create({
      name,
      slug,
      logo,
      featured: featured ?? true,
    });

    await recordAuditLog(req, 'CREATE_BRAND', 'Brand', brand._id.toString(), { name });
    res.status(201).json({ success: true, brand });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = pickAllowedFields(req.body, ['name', 'logo', 'featured']);
    const brand = await Brand.findByIdAndUpdate(id, updates, { new: true });
    if (!brand) {
      res.status(404).json({ success: false, message: 'Brand not found.' });
      return;
    }

    await recordAuditLog(req, 'UPDATE_BRAND', 'Brand', id, updates);
    res.json({ success: true, brand });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      res.status(404).json({ success: false, message: 'Brand not found.' });
      return;
    }

    await recordAuditLog(req, 'DELETE_BRAND', 'Brand', id, { name: brand.name });
    res.json({ success: true, message: 'Brand deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
