import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ active: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, active: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    const products = await Product.find({ category: category._id, active: true })
      .populate('sellerId', 'storeName slug rating')
      .sort({ featured: -1, createdAt: -1 })
      .limit(100);
    res.json({ success: true, category, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, icon, image, bgColor, description, order } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(409).json({ success: false, message: 'A category with this slug already exists.' });
      return;
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      image,
      bgColor: bgColor || '#F3F4F6',
      description,
      order: order || 0,
    });

    await recordAuditLog(req, 'CREATE_CATEGORY', 'Category', category._id.toString(), { name });

    res.status(201).json({ success: true, category });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(
      id,
      {
        ...(req.body.name !== undefined && { name: req.body.name }),
        ...(req.body.icon !== undefined && { icon: req.body.icon }),
        ...(req.body.image !== undefined && { image: req.body.image }),
        ...(req.body.bgColor !== undefined && { bgColor: req.body.bgColor }),
        ...(req.body.description !== undefined && { description: req.body.description }),
        ...(req.body.order !== undefined && { order: Number(req.body.order) }),
        ...(typeof req.body.active === 'boolean' && { active: req.body.active }),
      },
      { new: true, runValidators: true }
    );
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    await recordAuditLog(req, 'UPDATE_CATEGORY', 'Category', id, req.body);
    res.json({ success: true, category });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    await recordAuditLog(req, 'DELETE_CATEGORY', 'Category', id, { name: category.name });
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
