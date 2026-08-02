import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Expense } from '../models/Expense';
import { Category } from '../models/Category';

const escapeRegex = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      page = '1',
      limit = '10',
      month,
      year,
      categoryId,
      keyword,
      startDate,
      endDate,
      sortBy = 'expenseDate',
      sortOrder = 'desc'
    } = req.query;

    // 1. Validate page & limit
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);

    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({
        success: false,
        message: 'Trang (page) phải là số nguyên lớn hơn hoặc bằng 1',
        data: null
      });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        success: false,
        message: 'Giới hạn (limit) phải là số nguyên từ 1 đến 100',
        data: null
      });
      return;
    }

    // 2. Validate sortBy & sortOrder
    const allowedSortFields = ['expenseDate', 'amount', 'createdAt'];
    if (!allowedSortFields.includes(String(sortBy))) {
      res.status(400).json({
        success: false,
        message: 'Trường sắp xếp (sortBy) không hợp lệ. Chỉ cho phép: expenseDate, amount, createdAt',
        data: null
      });
      return;
    }

    const sortOrderStr = String(sortOrder).toLowerCase();
    if (!['asc', 'desc'].includes(sortOrderStr)) {
      res.status(400).json({
        success: false,
        message: 'Thứ tự sắp xếp (sortOrder) chỉ nhận giá trị "asc" hoặc "desc"',
        data: null
      });
      return;
    }

    const queryFilter: any = { userId };

    // 3. Validate categoryId trong filter nếu có
    if (categoryId !== undefined && categoryId !== '') {
      if (!Types.ObjectId.isValid(String(categoryId))) {
        res.status(400).json({
          success: false,
          message: 'categoryId trong bộ lọc không hợp lệ',
          data: null
        });
        return;
      }

      // Kiểm tra categoryId có thuộc sở hữu của user hay không
      const categoryExists = await Category.findOne({ _id: categoryId, userId });
      if (!categoryExists) {
        // Trả về danh sách rỗng để tránh tiết lộ dữ liệu user khác
        res.status(200).json({
          success: true,
          message: 'Lấy danh sách khoản chi thành công',
          data: {
            items: [],
            pagination: {
              totalItems: 0,
              currentPage: pageNum,
              totalPages: 0,
              limit: limitNum
            }
          }
        });
        return;
      }

      queryFilter.categoryId = categoryId;
    }

    // 4. Filter theo startDate / endDate
    let startD: Date | null = null;
    let endD: Date | null = null;

    if (startDate) {
      const parsed = new Date(String(startDate));
      if (isNaN(parsed.getTime())) {
        res.status(400).json({
          success: false,
          message: 'startDate không hợp lệ',
          data: null
        });
        return;
      }
      // Lấy từ đầu ngày
      startD = new Date(parsed.setHours(0, 0, 0, 0));
    }

    if (endDate) {
      const parsed = new Date(String(endDate));
      if (isNaN(parsed.getTime())) {
        res.status(400).json({
          success: false,
          message: 'endDate không hợp lệ',
          data: null
        });
        return;
      }
      // Lấy đến cuối ngày
      endD = new Date(parsed.setHours(23, 59, 59, 999));
    }

    if (startD && endD && startD > endD) {
      res.status(400).json({
        success: false,
        message: 'startDate không được lớn hơn endDate',
        data: null
      });
      return;
    }

    if (startD || endD) {
      queryFilter.expenseDate = {};
      if (startD) queryFilter.expenseDate.$gte = startD;
      if (endD) queryFilter.expenseDate.$lte = endD;
    }

    // 5. Filter theo month / year (nếu không dùng startDate/endDate)
    if (!startD && !endD) {
      let monthNum: number | undefined;
      let yearNum: number | undefined;

      if (month !== undefined && month !== '') {
        monthNum = parseInt(String(month), 10);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          res.status(400).json({
            success: false,
            message: 'Tháng (month) phải là số nguyên từ 1 đến 12',
            data: null
          });
          return;
        }
      }

      if (year !== undefined && year !== '') {
        yearNum = parseInt(String(year), 10);
        if (isNaN(yearNum)) {
          res.status(400).json({
            success: false,
            message: 'Năm (year) phải là số nguyên hợp lệ',
            data: null
          });
          return;
        }
      }

      if (monthNum !== undefined && yearNum !== undefined) {
        const startOfMonth = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0));
        queryFilter.expenseDate = { $gte: startOfMonth, $lt: endOfMonth };
      } else if (yearNum !== undefined) {
        const startOfYear = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0));
        const endOfYear = new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0, 0));
        queryFilter.expenseDate = { $gte: startOfYear, $lt: endOfYear };
      } else if (monthNum !== undefined) {
        queryFilter.$expr = { $eq: [{ $month: '$expenseDate' }, monthNum] };
      }
    }

    // 6. Filter theo keyword (tìm trong trường note)
    if (keyword !== undefined && String(keyword).trim() !== '') {
      queryFilter.note = { $regex: new RegExp(escapeRegex(String(keyword).trim()), 'i') };
    }

    // 7. Đếm tổng số phần tử & phân trang
    const totalItems = await Expense.countDocuments(queryFilter);
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limitNum) : 0;
    const skip = (pageNum - 1) * limitNum;

    const items = await Expense.find(queryFilter)
      .sort({ [String(sortBy)]: sortOrderStr === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('categoryId', '_id name icon color');

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách khoản chi thành công',
      data: {
        items,
        pagination: {
          totalItems,
          currentPage: pageNum,
          totalPages,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy danh sách khoản chi',
      data: null
    });
  }
};

export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID khoản chi không hợp lệ',
        data: null
      });
      return;
    }

    const expense = await Expense.findOne({ _id: id, userId }).populate(
      'categoryId',
      '_id name icon color'
    );

    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản chi',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin khoản chi thành công',
      data: expense
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy chi tiết khoản chi',
      data: null
    });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount, expenseDate, note, categoryId } = req.body;

    // 1. Validate amount
    const numAmount = Number(amount);
    if (amount === undefined || amount === null || !Number.isFinite(numAmount) || numAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Số tiền chi (amount) phải là số lớn hơn 0',
        data: null
      });
      return;
    }

    // 2. Validate expenseDate
    if (!expenseDate || isNaN(new Date(expenseDate).getTime())) {
      res.status(400).json({
        success: false,
        message: 'Thời gian chi (expenseDate) không hợp lệ',
        data: null
      });
      return;
    }

    // 3. Validate categoryId
    if (!categoryId || !Types.ObjectId.isValid(String(categoryId))) {
      res.status(400).json({
        success: false,
        message: 'categoryId không hợp lệ',
        data: null
      });
      return;
    }

    const categoryExists = await Category.findOne({ _id: categoryId, userId });
    if (!categoryExists) {
      res.status(400).json({
        success: false,
        message: 'Danh mục không tồn tại hoặc không thuộc quyền sở hữu',
        data: null
      });
      return;
    }

    // 4. Tạo Expense
    const newExpense = await Expense.create({
      amount: numAmount,
      expenseDate: new Date(expenseDate),
      note: note ? String(note).trim() : '',
      categoryId,
      userId
    });

    const populatedExpense = await Expense.findById(newExpense._id).populate(
      'categoryId',
      '_id name icon color'
    );

    res.status(201).json({
      success: true,
      message: 'Tạo khoản chi thành công',
      data: populatedExpense
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi tạo khoản chi',
      data: null
    });
  }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { amount, expenseDate, note, categoryId } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID khoản chi không hợp lệ',
        data: null
      });
      return;
    }

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản chi',
        data: null
      });
      return;
    }

    // Chỉ cập nhật các trường được phép
    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (amount === null || !Number.isFinite(numAmount) || numAmount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Số tiền chi (amount) phải là số lớn hơn 0',
          data: null
        });
        return;
      }
      expense.amount = numAmount;
    }

    if (expenseDate !== undefined) {
      if (!expenseDate || isNaN(new Date(expenseDate).getTime())) {
        res.status(400).json({
          success: false,
          message: 'Thời gian chi (expenseDate) không hợp lệ',
          data: null
        });
        return;
      }
      expense.expenseDate = new Date(expenseDate);
    }

    if (note !== undefined) {
      expense.note = String(note).trim();
    }

    if (categoryId !== undefined) {
      if (!Types.ObjectId.isValid(String(categoryId))) {
        res.status(400).json({
          success: false,
          message: 'categoryId không hợp lệ',
          data: null
        });
        return;
      }

      const categoryExists = await Category.findOne({ _id: categoryId, userId });
      if (!categoryExists) {
        res.status(400).json({
          success: false,
          message: 'Danh mục không tồn tại hoặc không thuộc quyền sở hữu',
          data: null
        });
        return;
      }
      expense.categoryId = categoryId;
    }

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id).populate(
      'categoryId',
      '_id name icon color'
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật khoản chi thành công',
      data: updatedExpense
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi cập nhật khoản chi',
      data: null
    });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID khoản chi không hợp lệ',
        data: null
      });
      return;
    }

    const deletedExpense = await Expense.findOneAndDelete({ _id: id, userId });
    if (!deletedExpense) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản chi',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Xóa khoản chi thành công',
      data: deletedExpense
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi xóa khoản chi',
      data: null
    });
  }
};
