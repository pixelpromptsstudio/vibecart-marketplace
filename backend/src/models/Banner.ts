import mongoose, { Schema, Document } from 'mongoose';

export type BannerPosition = 'HERO' | 'DEAL' | 'PROMO' | 'SIDE';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  position: BannerPosition;
  active: boolean;
  sortOrder: number;
  bgColor?: string;
  accentColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: String,
    badge: String,
    image: { type: String, required: true },
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/search' },
    position: {
      type: String,
      enum: ['HERO', 'DEAL', 'PROMO', 'SIDE'],
      default: 'HERO',
      index: true,
    },
    active: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    bgColor: String,
    accentColor: String,
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
