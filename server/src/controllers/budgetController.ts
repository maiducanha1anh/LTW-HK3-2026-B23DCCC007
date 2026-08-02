import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Budget } from '../models/Budget';
import { Expense } from '../models/Expense';

export const getBudgets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { year } = req.query;

    const queryFilter: any = { userId };

    if (year !== undefined && year !== '') {
      const yearNum = parseInt(String(year), 10);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        res.status(400).json({
          success: false,
          message: 'Năm (year) phải là số nguyên từ 2000 đến 2100',
          data: null
        });
        return;
      }
      queryFilter.year = yearNum;
    }

    const budgets = await Budget.find(queryFilter).sort({ year: -1, month: 1 });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách định mức thành công',
      data: budgets
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy danh sách định mức',
      data: null
    });
  }
};

export const getCurrentBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month, year } = req.query;

    let monthNum: number;
    let yearNum: number;

    const now = new Date();

    if (month === undefined && year === undefined) {
      monthNum = now.getMonth() + 1;
      yearNum = now.getFullYear();
    } else {
      if (month === undefined || year === undefined) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ cả month và year khi lọc định mức hiện tại',
          data: null
        });
        return;
      }

      monthNum = parseInt(String(month), 10);
      yearNum = parseInt(String(year), 10);

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        res.status(400).json({
          success: false,
          message: 'Tháng (month) phải là số nguyên từ 1 đến 12',
          data: null
        });
        return;
      }

      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        res.status(400).json({
          success: false,
          message: 'Năm (year) phải là số nguyên từ 2000 đến 2100',
          data: null
        });
        return;
      }
    }

    // 1. Tính tổng số tiền đã chi (spentAmount) của user trong tháng/năm
    const startOfMonth = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0));

    const expenseAggregation = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const spentAmount = expenseAggregation.length > 0 ? Number(expenseAggregation[0].totalSpent.toFixed(2)) : 0;

    // 2. Tìm định mức của tháng/năm đó
    const budget = await Budget.findOne({ userId, month: monthNum, year: yearNum });

    if (!budget) {
      res.status(200).json({
        success: true,
        message: 'Chưa thiết lập định mức cho tháng này',
        data: {
          budgetId: null,
          month: monthNum,
          year: yearNum,
          budgetAmount: 0,
          spentAmount,
          remainingAmount: 0,
          exceededAmount: 0,
          usagePercent: 0,
          status: 'NO_BUDGET'
        }
      });
      return;
    }

    const budgetAmount = budget.amount;
    const remainingAmount = spentAmount <= budgetAmount ? Number((budgetAmount - spentAmount).toFixed(2)) : 0;
    const exceededAmount = spentAmount > budgetAmount ? Number((spentAmount - budgetAmount).toFixed(2)) : 0;
    const usagePercent = budgetAmount > 0 ? Number(((spentAmount / budgetAmount) * 100).toFixed(2)) : 0;

    let status = 'NORMAL';
    if (usagePercent > 100) {
      status = 'EXCEEDED';
    } else if (usagePercent >= 80) {
      status = 'WARNING';
    }

    res.status(200).json({
      success: true,
      message: 'Lấy định mức chi tiêu hiện tại thành công',
      data: {
        budgetId: budget._id.toString(),
        month: monthNum,
        year: yearNum,
        budgetAmount,
        spentAmount,
        remainingAmount,
        exceededAmount,
        usagePercent,
        status
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy định mức chi tiêu hiện tại',
      data: null
    });
  }
};

export const getBudgetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID định mức không hợp lệ',
        data: null
      });
      return;
    }

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy định mức',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin định mức thành công',
      data: budget
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy chi tiết định mức',
      data: null
    });
  }
};

export const createBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month, year, amount } = req.body;

    const monthNum = parseInt(String(month), 10);
    const yearNum = parseInt(String(year), 10);
    const numAmount = Number(amount);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400).json({
        success: false,
        message: 'Tháng (month) phải là số nguyên từ 1 đến 12',
        data: null
      });
      return;
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      res.status(400).json({
        success: false,
        message: 'Năm (year) phải là số nguyên từ 2000 đến 2100',
        data: null
      });
      return;
    }

    if (amount === undefined || amount === null || !Number.isFinite(numAmount) || numAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Định mức chi tiêu (amount) phải là số lớn hơn 0',
        data: null
      });
      return;
    }

    // Kiểm tra trùng lặp định mức cùng month/year của cùng user
    const existingBudget = await Budget.findOne({ userId, month: monthNum, year: yearNum });
    if (existingBudget) {
      res.status(409).json({
        success: false,
        message: `Định mức chi tiêu cho tháng ${monthNum}/${yearNum} đã tồn tại`,
        data: null
      });
      return;
    }

    const newBudget = await Budget.create({
      userId,
      month: monthNum,
      year: yearNum,
      amount: numAmount
    });

    res.status(201).json({
      success: true,
      message: 'Thiết lập định mức chi tiêu thành công',
      data: newBudget
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Định mức chi tiêu cho tháng này đã tồn tại',
        data: null
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi tạo định mức chi tiêu',
      data: null
    });
  }
};

export const updateBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { month, year, amount } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID định mức không hợp lệ',
        data: null
      });
      return;
    }

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy định mức',
        data: null
      });
      return;
    }

    let targetMonth = budget.month;
    let targetYear = budget.year;

    if (month !== undefined) {
      const mNum = parseInt(String(month), 10);
      if (isNaN(mNum) || mNum < 1 || mNum > 12) {
        res.status(400).json({
          success: false,
          message: 'Tháng (month) phải là số nguyên từ 1 đến 12',
          data: null
        });
        return;
      }
      targetMonth = mNum;
    }

    if (year !== undefined) {
      const yNum = parseInt(String(year), 10);
      if (isNaN(yNum) || yNum < 2000 || yNum > 2100) {
        res.status(400).json({
          success: false,
          message: 'Năm (year) phải là số nguyên từ 2000 đến 2100',
          data: null
        });
        return;
      }
      targetYear = yNum;
    }

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (amount === null || !Number.isFinite(numAmount) || numAmount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Định mức chi tiêu (amount) phải là số lớn hơn 0',
          data: null
        });
        return;
      }
      budget.amount = numAmount;
    }

    // Nếu thay đổi month hoặc year, kiểm tra trùng lặp với định mức khác
    if (targetMonth !== budget.month || targetYear !== budget.year) {
      const existingBudget = await Budget.findOne({
        _id: { $ne: id },
        userId,
        month: targetMonth,
        year: targetYear
      });

      if (existingBudget) {
        res.status(409).json({
          success: false,
          message: `Định mức chi tiêu cho tháng ${targetMonth}/${targetYear} đã tồn tại`,
          data: null
        });
        return;
      }
    }

    budget.month = targetMonth;
    budget.year = targetYear;

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật định mức thành công',
      data: budget
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Định mức chi tiêu cho tháng này đã tồn tại',
        data: null
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi cập nhật định mức',
      data: null
    });
  }
};

export const deleteBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID định mức không hợp lệ',
        data: null
      });
      return;
    }

    const deletedBudget = await Budget.findOneAndDelete({ _id: id, userId });
    if (!deletedBudget) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy định mức',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Xóa định mức thành công',
      data: deletedBudget
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi xóa định mức',
      data: null
    });
  }
};
