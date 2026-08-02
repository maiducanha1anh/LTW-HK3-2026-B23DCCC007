import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Category } from '../models/Category';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}){1,2}$/;

const escapeRegex = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const categories = await Category.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy danh sách danh mục',
      data: null
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 1. Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID danh mục không hợp lệ',
        data: null
      });
      return;
    }

    // 2. Tìm category thuộc user hiện tại
    const category = await Category.findOne({ _id: id, userId });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin danh mục thành công',
      data: category
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy chi tiết danh mục',
      data: null
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, icon, color, type } = req.body;

    // 1. Validate name không rỗng
    if (!name || !String(name).trim()) {
      res.status(400).json({
        success: false,
        message: 'Tên danh mục không được để rỗng',
        data: null
      });
      return;
    }

    const trimmedName = String(name).trim();

    // 2. Validate type nếu được truyền lên
    if (type !== undefined && type !== 'expense') {
      res.status(400).json({
        success: false,
        message: 'Loại danh mục chỉ nhận giá trị "expense"',
        data: null
      });
      return;
    }

    // 3. Validate color nếu được truyền lên
    if (color !== undefined && color !== null && color !== '') {
      if (!HEX_COLOR_REGEX.test(String(color).trim())) {
        res.status(400).json({
          success: false,
          message: 'Mã màu không hợp lệ. Vui lòng sử dụng định dạng Hex (ví dụ: #6c757d)',
          data: null
        });
        return;
      }
    }

    // 4. Kiểm tra trùng tên (không phân biệt chữ hoa / chữ thường trong cùng 1 user)
    const existingCategory = await Category.findOne({
      userId,
      name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') }
    });

    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'Tên danh mục này đã tồn tại',
        data: null
      });
      return;
    }

    // 5. Tạo danh mục mới (userId luôn lấy từ req.user.id)
    const newCategory = await Category.create({
      name: trimmedName,
      icon: icon ? String(icon).trim() : 'tag',
      color: color ? String(color).trim() : '#6c757d',
      type: 'expense',
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: newCategory
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Tên danh mục này đã tồn tại',
        data: null
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi tạo danh mục',
      data: null
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, icon, color, type } = req.body;

    // 1. Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID danh mục không hợp lệ',
        data: null
      });
      return;
    }

    // 2. Tìm danh mục thuộc user hiện tại
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
        data: null
      });
      return;
    }

    // 3. Validate name nếu được truyền
    if (name !== undefined) {
      if (!String(name).trim()) {
        res.status(400).json({
          success: false,
          message: 'Tên danh mục không được để rỗng',
          data: null
        });
        return;
      }

      const trimmedName = String(name).trim();

      // Kiểm tra trùng tên với danh mục khác của cùng user (case-insensitive)
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        userId,
        name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') }
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Tên danh mục này đã tồn tại',
          data: null
        });
        return;
      }

      category.name = trimmedName;
    }

    // 4. Validate type nếu được truyền
    if (type !== undefined && type !== 'expense') {
      res.status(400).json({
        success: false,
        message: 'Loại danh mục chỉ nhận giá trị "expense"',
        data: null
      });
      return;
    }

    // 5. Validate color nếu được truyền
    if (color !== undefined && color !== null && color !== '') {
      if (!HEX_COLOR_REGEX.test(String(color).trim())) {
        res.status(400).json({
          success: false,
          message: 'Mã màu không hợp lệ. Vui lòng sử dụng định dạng Hex (ví dụ: #6c757d)',
          data: null
        });
        return;
      }
      category.color = String(color).trim();
    }

    if (icon !== undefined) {
      category.icon = String(icon).trim();
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Tên danh mục này đã tồn tại',
        data: null
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi cập nhật danh mục',
      data: null
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 1. Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID danh mục không hợp lệ',
        data: null
      });
      return;
    }

    // 2. Tìm và xóa danh mục thuộc user hiện tại
    const deletedCategory = await Category.findOneAndDelete({ _id: id, userId });

    if (!deletedCategory) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Xóa danh mục thành công',
      data: deletedCategory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi xóa danh mục',
      data: null
    });
  }
};
