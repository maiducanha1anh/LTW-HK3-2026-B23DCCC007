import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  amount: number;
  expenseDate: Date;
  note: string;
  categoryId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: {
      type: Number,
      required: [true, 'Số tiền chi là bắt buộc'],
      min: [0.01, 'Số tiền chi phải lớn hơn 0']
    },
    expenseDate: {
      type: Date,
      required: [true, 'Thời gian chi là bắt buộc']
    },
    note: {
      type: String,
      default: '',
      trim: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'categoryId là bắt buộc'],
      index: true
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

// Tạo các chỉ mục tối ưu truy vấn
expenseSchema.index({ userId: 1, expenseDate: -1 });
expenseSchema.index({ userId: 1, categoryId: 1 });

export const Expense = model<IExpense>('Expense', expenseSchema);
