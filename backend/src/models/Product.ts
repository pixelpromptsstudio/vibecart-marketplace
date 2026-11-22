import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant {
  color?: string;
  size?: string;
  sku?: string;
  stock: number;
  price?: number;
  image?: string;
}

export interface ISpecification {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: mongoose.Types.ObjectId | string;
  subcategory?: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  videos?: string[];
  variants: IVariant[];
  sku: string;
  stock: number;
  specifications: ISpecification[];
  sellerId: mongoose.Types.ObjectId;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  trending: boolean;
  active: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  deliveryInfo: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  color: String,
  size: String,
  sku: String,
  stock: { type: Number, default: 10 },
  price: Number,
  image: String,
});

const SpecificationSchema = new Schema<ISpecification>({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    images: [{ type: String, required: true }],
    videos: [{ type: String }],
    variants: [VariantSchema],
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    specifications: [SpecificationSchema],
    sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    tags: [{ type: String, lowercase: true }],
    featured: { type: Boolean, default: false, index: true },
    trending: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    deliveryInfo: { type: String, default: 'Free delivery in 2-3 business days' },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
