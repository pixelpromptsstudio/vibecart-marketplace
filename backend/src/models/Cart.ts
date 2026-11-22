import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  _id?: string;
  product: mongoose.Types.ObjectId;
  variantId?: string;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  appliedCoupon?: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountAmount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  addedAt: { type: Date, default: Date.now },
});

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [CartItemSchema],
    appliedCoupon: {
      code: String,
      discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'] },
      discountAmount: Number,
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
