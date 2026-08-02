import { Schema, model, Document, Types } from 'mongoose';

export interface IBudget extends Document {
  userId: Types.ObjectId;
  month: number;
  year: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId là bắt buộc'],
      index: true
    },
    month: {
      type: Number,
      required: [true, 'Tháng (month) là bắt buộc'],
      min: [1, 'Tháng phải từ 1 đến 12'],
      max: [12, 'Tháng phải từ 1 đến 12']
    },
    year: {
      type: Number,
      required: [true, 'Năm (year) là bắt buộc'],
      min: [2000, 'Năm phải từ 2000 đến 2100'],
      max: [2100, 'Năm phải từ 2000 đến 2100']
    },
    amount: {
      type: Number,
      required: [true, 'Định mức chi tiêu (amount) là bắt buộc'],
      min: [0.01, 'Định mức chi tiêu phải lớn hơn 0']
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index đảm bảo mỗi user chỉ có duy nhất 1 định mức trong 1 tháng/năm
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export const Budget = model<IBudget>('Budget', budgetSchema);
