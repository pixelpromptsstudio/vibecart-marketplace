import mongoose, { Schema, Document } from 'mongoose';

export interface IReel extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  likesCount: number;
  viewsCount: number;
  sharesCount: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReelSchema = new Schema<IReel>(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Reel = mongoose.model<IReel>('Reel', ReelSchema);
