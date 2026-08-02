import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';

export const getMonthSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month, year } = req.query;

    const now = new Date();
    let monthNum: number;
    let yearNum: number;

    if (month === undefined && year === undefined) {
      monthNum = now.getMonth() + 1;
      yearNum = now.getFullYear();
    } else {
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

    const startOfMonth = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0));

    // Aggregate tổng chi tiêu trong tháng của user
    const expAgg = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);

    const totalExpense = expAgg.length > 0 ? Number(expAgg[0].totalExpense.toFixed(2)) : 0;
    const expenseCount = expAgg.length > 0 ? expAgg[0].expenseCount : 0;

    // Lấy định mức
    const budget = await Budget.findOne({ userId, month: monthNum, year: yearNum });

    if (!budget) {
      res.status(200).json({
        success: true,
        message: 'Lấy báo cáo tổng hợp tháng thành công',
        data: {
          month: monthNum,
          year: yearNum,
          totalExpense,
          expenseCount,
          budgetAmount: 0,
          remainingAmount: 0,
          exceededAmount: 0,
          usagePercent: 0,
          status: 'NO_BUDGET'
        }
      });
      return;
    }

    const budgetAmount = budget.amount;
    const remainingAmount = totalExpense <= budgetAmount ? Number((budgetAmount - totalExpense).toFixed(2)) : 0;
    const exceededAmount = totalExpense > budgetAmount ? Number((totalExpense - budgetAmount).toFixed(2)) : 0;
    const usagePercent = budgetAmount > 0 ? Number(((totalExpense / budgetAmount) * 100).toFixed(2)) : 0;

    let status = 'NORMAL';
    if (usagePercent > 100) {
      status = 'EXCEEDED';
    } else if (usagePercent >= 80) {
      status = 'WARNING';
    }

    res.status(200).json({
      success: true,
      message: 'Lấy báo cáo tổng hợp tháng thành công',
      data: {
        month: monthNum,
        year: yearNum,
        totalExpense,
        expenseCount,
        budgetAmount,
        remainingAmount,
        exceededAmount,
        usagePercent,
        status
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy báo cáo tổng hợp tháng',
      data: null
    });
  }
};

export const getCategorySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month, year } = req.query;

    const now = new Date();
    let monthNum: number;
    let yearNum: number;

    if (month === undefined && year === undefined) {
      monthNum = now.getMonth() + 1;
      yearNum = now.getFullYear();
    } else {
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

    const startOfMonth = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0));

    const categoryAgg = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$categoryId',
          totalAmount: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    if (categoryAgg.length === 0) {
      res.status(200).json({
        success: true,
        message: 'Lấy báo cáo theo danh mục thành công',
        data: []
      });
      return;
    }

    const monthTotalExpense = categoryAgg.reduce((acc, item) => acc + item.totalAmount, 0);

    const result = categoryAgg.map((item) => {
      const cat = item.categoryInfo && item.categoryInfo.length > 0 ? item.categoryInfo[0] : null;
      const categoryName = cat ? cat.name : 'Danh mục đã xóa';
      const icon = cat ? cat.icon : 'tag';
      const color = cat ? cat.color : '#6c757d';
      const percentage = monthTotalExpense > 0 ? Number(((item.totalAmount / monthTotalExpense) * 100).toFixed(2)) : 0;

      return {
        categoryId: item._id ? item._id.toString() : null,
        categoryName,
        icon,
        color,
        totalAmount: Number(item.totalAmount.toFixed(2)),
        expenseCount: item.expenseCount,
        percentage
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lấy báo cáo theo danh mục thành công',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy báo cáo theo danh mục',
      data: null
    });
  }
};

export const getYearSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { year } = req.query;

    const now = new Date();
    let yearNum: number;

    if (year === undefined || year === '') {
      yearNum = now.getFullYear();
    } else {
      yearNum = parseInt(String(year), 10);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        res.status(400).json({
          success: false,
          message: 'Năm (year) phải là số nguyên từ 2000 đến 2100',
          data: null
        });
        return;
      }
    }

    const startOfYear = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0, 0));

    // Aggregate tổng chi từng tháng trong năm
    const expByMonthAgg = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          expenseDate: { $gte: startOfYear, $lt: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$expenseDate' },
          spentAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Lấy tất cả budget trong năm
    const budgets = await Budget.find({ userId, year: yearNum });

    // Tạo kết quả luôn đủ 12 tháng từ 1 đến 12
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const exp = expByMonthAgg.find((item) => item._id === m);
      const spentAmount = exp ? Number(exp.spentAmount.toFixed(2)) : 0;
      const b = budgets.find((item) => item.month === m);

      if (!b) {
        result.push({
          month: m,
          budgetAmount: 0,
          spentAmount,
          remainingAmount: 0,
          exceededAmount: 0,
          usagePercent: 0,
          status: 'NO_BUDGET'
        });
      } else {
        const budgetAmount = b.amount;
        const remainingAmount = spentAmount <= budgetAmount ? Number((budgetAmount - spentAmount).toFixed(2)) : 0;
        const exceededAmount = spentAmount > budgetAmount ? Number((spentAmount - budgetAmount).toFixed(2)) : 0;
        const usagePercent = budgetAmount > 0 ? Number(((spentAmount / budgetAmount) * 100).toFixed(2)) : 0;

        let status = 'NORMAL';
        if (usagePercent > 100) {
          status = 'EXCEEDED';
        } else if (usagePercent >= 80) {
          status = 'WARNING';
        }

        result.push({
          month: m,
          budgetAmount,
          spentAmount,
          remainingAmount,
          exceededAmount,
          usagePercent,
          status
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Lấy báo cáo 12 tháng thành công',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy báo cáo 12 tháng',
      data: null
    });
  }
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const monthNum = now.getMonth() + 1;
    const yearNum = now.getFullYear();

    // 1. Chi tiêu tháng hiện tại
    const startOfMonth = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0));

    const monthAgg = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);

    const totalExpenseThisMonth = monthAgg.length > 0 ? Number(monthAgg[0].totalExpense.toFixed(2)) : 0;
    const expenseCountThisMonth = monthAgg.length > 0 ? monthAgg[0].expenseCount : 0;

    // 2. Chi tiêu hôm nay (tính theo timezone local của server từ 00:00:00.000 đến 23:59:59.999)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayAgg = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          expenseDate: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: null,
          totalToday: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenseToday = todayAgg.length > 0 ? Number(todayAgg[0].totalToday.toFixed(2)) : 0;

    // 3. Định mức tháng hiện tại
    const budget = await Budget.findOne({ userId, month: monthNum, year: yearNum });

    let budgetAmount = 0;
    let remainingAmount = 0;
    let exceededAmount = 0;
    let usagePercent = 0;
    let status = 'NO_BUDGET';

    if (budget) {
      budgetAmount = budget.amount;
      remainingAmount = totalExpenseThisMonth <= budgetAmount ? Number((budgetAmount - totalExpenseThisMonth).toFixed(2)) : 0;
      exceededAmount = totalExpenseThisMonth > budgetAmount ? Number((totalExpenseThisMonth - budgetAmount).toFixed(2)) : 0;
      usagePercent = budgetAmount > 0 ? Number(((totalExpenseThisMonth / budgetAmount) * 100).toFixed(2)) : 0;

      if (usagePercent > 100) {
        status = 'EXCEEDED';
      } else if (usagePercent >= 80) {
        status = 'WARNING';
      } else {
        status = 'NORMAL';
      }
    }

    // 4. 5 khoản chi mới nhất của user (toàn bộ thời gian)
    const latestExpenses = await Expense.find({ userId })
      .sort({ expenseDate: -1, createdAt: -1 })
      .limit(5)
      .populate('categoryId', '_id name icon color');

    // 5. Tối đa 5 danh mục chi nhiều nhất trong tháng hiện tại
    const categoryAgg = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$categoryId',
          totalAmount: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const topCategories = categoryAgg.map((item) => {
      const cat = item.categoryInfo && item.categoryInfo.length > 0 ? item.categoryInfo[0] : null;
      const categoryName = cat ? cat.name : 'Danh mục đã xóa';
      const icon = cat ? cat.icon : 'tag';
      const color = cat ? cat.color : '#6c757d';
      const percentage = totalExpenseThisMonth > 0 ? Number(((item.totalAmount / totalExpenseThisMonth) * 100).toFixed(2)) : 0;

      return {
        categoryId: item._id ? item._id.toString() : null,
        categoryName,
        icon,
        color,
        totalAmount: Number(item.totalAmount.toFixed(2)),
        expenseCount: item.expenseCount,
        percentage
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu Dashboard thành công',
      data: {
        month: monthNum,
        year: yearNum,
        totalExpenseThisMonth,
        totalExpenseToday,
        expenseCountThisMonth,
        budgetAmount,
        remainingAmount,
        exceededAmount,
        usagePercent,
        status,
        latestExpenses,
        topCategories
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy dữ liệu Dashboard',
      data: null
    });
  }
};
