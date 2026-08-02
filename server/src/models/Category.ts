import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon: string;
  color: string;
  type: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true
    },
    icon: {
      type: String,
      default: 'tag',
      trim: true
    },
    color: {
      type: String,
      default: '#6c757d',
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['expense'],
        message: 'Loại danh mục chỉ nhận giá trị "expense"'
      },
      default: 'expense'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId là bắt buộc'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Tạo compound index đảm bảo mỗi user không thể tạo trùng tên danh mục
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>('Category', categorySchema);
