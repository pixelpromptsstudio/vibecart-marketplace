import mongoose, { Schema, Document } from 'mongoose';

export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface ISeller extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  storeName: string;
  slug: string;
  storeLogo?: string;
  description?: string;
  businessAddress?: string;
  phone: string;
  verificationStatus: SellerStatus;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
  };
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    storeName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    storeLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=150',
    },
    description: { type: String },
    businessAddress: { type: String },
    phone: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,
    },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Seller = mongoose.model<ISeller>('Seller', SellerSchema);
