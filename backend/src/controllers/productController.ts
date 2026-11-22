import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Seller } from '../models/Seller';
import { AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/audit';
import { escapeRegex, parsePositiveInt, pickAllowedFields } from '../utils/helpers';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      trending,
      featured,
      sellerId,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const query: any = { active: true, approvalStatus: 'APPROVED' };

    // Search (regex-escaped to avoid ReDoS/syntax crashes)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ];
    }

    // Category filter by slug or ID
    if (category && typeof category === 'string' && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          query.category = foundCategory._id;
        } else {
          res.json({
            success: true,
            products: [],
            pagination: {
              page: 1,
              limit: parsePositiveInt(limit, 12, 100),
              total: 0,
              totalPages: 0,
            },
          });
          return;
        }
      }
    }

    // Brand filter
    if (brand && typeof brand === 'string' && brand !== 'all') {
      const brands = brand
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);
      if (brands.length > 0) {
        query.brand = {
          $in: brands.map((b) => new RegExp(`^${escapeRegex(b)}$`, 'i')),
        };
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Trending & Featured
    if (trending === 'true') query.trending = true;
    if (featured === 'true') query.featured = true;

    // Seller filter
    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId as string)) {
      query.sellerId = sellerId;
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    switch (sort) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
        sortOptions = { reviewCount: -1, rating: -1 };
        break;
      case 'discount':
        sortOptions = { discount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const pageNum = parsePositiveInt(page, 1, 10000);
    const limitNum = parsePositiveInt(limit, 12, 100);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('sellerId', 'storeName slug rating')
        .sort(sortOptions)
        .skip(skip)
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

export const getTrendingProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ active: true, approvalStatus: 'APPROVED', trending: true })
      .populate('category', 'name slug')
      .populate('sellerId', 'storeName slug')
      .limit(10)
      .sort({ rating: -1, reviewCount: -1 });

    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTodayDeals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      active: true,
      approvalStatus: 'APPROVED',
      discount: { $gte: 20 },
    })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ discount: -1 });

    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductBySlugOrId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    const product = await Product.findOne(
      isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
    )
      .populate('category')
      .populate('sellerId');

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Fetch similar products in same category
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      active: true,
      approvalStatus: 'APPROVED',
    })
      .limit(4)
      .select('name slug price originalPrice discount images rating reviewCount brand');

    res.json({
      success: true,
      product,
      similarProducts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let sellerId = req.body.sellerId;

    if (req.user.role === 'SELLER') {
      const seller = await Seller.findOne({ userId: req.user.id });
      if (!seller) {
        res.status(403).json({ success: false, message: 'No registered seller profile found.' });
        return;
      }
      if (seller.verificationStatus !== 'APPROVED') {
        res.status(403).json({
          success: false,
          message: 'Your seller profile is pending approval. You cannot create products yet.',
        });
        return;
      }
      sellerId = seller._id;
    } else if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden. Seller or Admin required.' });
      return;
    }

    const {
      name,
      description,
      brand,
      category,
      subcategory,
      price,
      originalPrice,
      images,
      videos,
      variants,
      stock,
      specifications,
      tags,
      deliveryInfo,
    } = req.body;

    if (!name || !description || !brand || !category || !price || !images || images.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Name, description, brand, category, price, and at least one image are required.',
      });
      return;
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const sku = `SKU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const numPrice = Number(price);
    const numOrig = originalPrice ? Number(originalPrice) : numPrice;
    const discount = numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;

    const product = await Product.create({
      name,
      slug,
      description,
      brand,
      category,
      subcategory,
      price: numPrice,
      originalPrice: numOrig,
      discount,
      images,
      videos: videos || [],
      variants: variants || [],
      sku,
      stock: Number(stock || 10),
      specifications: specifications || [],
      sellerId,
      tags: tags || [],
      deliveryInfo: deliveryInfo || 'Free delivery in 2-3 business days',
      approvalStatus: 'APPROVED',
    });

    await recordAuditLog(req, 'CREATE_PRODUCT', 'Product', product._id.toString(), {
      name: product.name,
      price: product.price,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Role verification: sellers can only update their own products; reject customers
    if (!['SELLER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized to modify products.' });
      return;
    }

    if (req.user.role === 'SELLER') {
      const seller = await Seller.findOne({ userId: req.user.id });
      if (!seller || product.sellerId.toString() !== seller._id.toString()) {
        res.status(403).json({ success: false, message: 'Unauthorized to modify this product.' });
        return;
      }
    }

    const baseAllowedFields = [
      'name',
      'description',
      'brand',
      'category',
      'price',
      'originalPrice',
      'stock',
      'images',
      'specifications',
      'variants',
      'tags',
      'active',
    ] as const;

    const adminOnlyFields = ['approvalStatus', 'featured', 'trending'] as const;
    const isPrivileged = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    const updates = pickAllowedFields(
      req.body,
      isPrivileged ? [...baseAllowedFields, ...adminOnlyFields] : baseAllowedFields
    ) as Record<string, any>;

    if (updates.price !== undefined || updates.originalPrice !== undefined) {
      const p = Number(updates.price ?? product.price);
      const op = Number(updates.originalPrice ?? product.originalPrice ?? p);
      updates.discount = op > p ? Math.round(((op - p) / op) * 100) : 0;
    }

    Object.assign(product, updates);
    await product.save();

    await recordAuditLog(req, 'UPDATE_PRODUCT', 'Product', product._id.toString(), {
      updates: Object.keys(updates),
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    if (req.user.role === 'SELLER') {
      const seller = await Seller.findOne({ userId: req.user.id });
      if (!seller || product.sellerId.toString() !== seller._id.toString()) {
        res.status(403).json({ success: false, message: 'Unauthorized to delete this product.' });
        return;
      }
    }

    await Product.findByIdAndDelete(id);

    await recordAuditLog(req, 'DELETE_PRODUCT', 'Product', id, { name: product.name });

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
