import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET chưa được cấu hình trên máy chủ');
  }
  return secret;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, fullName } = req.body;

    // 1. Validation kiểm tra các trường dữ liệu
    if (!username || !email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin: username, email, password, fullName',
        data: null
      });
      return;
    }

    const trimmedUsername = String(username).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedFullName = String(fullName).trim();

    if (trimmedUsername.length < 3) {
      res.status(400).json({
        success: false,
        message: 'Username phải có tối thiểu 3 ký tự',
        data: null
      });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Email không đúng định dạng',
        data: null
      });
      return;
    }

    if (String(password).length < 6) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có tối thiểu 6 ký tự',
        data: null
      });
      return;
    }

    if (!trimmedFullName) {
      res.status(400).json({
        success: false,
        message: 'Họ và tên không được để rỗng',
        data: null
      });
      return;
    }

    // 2. Kiểm tra trùng lặp username hoặc email trước khi lưu
    const existingUser = await User.findOne({
      $or: [{ username: trimmedUsername }, { email: trimmedEmail }]
    });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        res.status(400).json({
          success: false,
          message: 'Username này đã được sử dụng',
          data: null
        });
        return;
      }
      if (existingUser.email === trimmedEmail) {
        res.status(400).json({
          success: false,
          message: 'Email này đã được đăng ký',
          data: null
        });
        return;
      }
    }

    // 3. Mã hóa password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo user mới
    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
      fullName: trimmedFullName
    });

    // 5. Tạo JWT Token
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { id: newUser._id.toString(), username: newUser.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 6. Phản hồi (không trả về password)
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        token,
        user: {
          id: newUser._id.toString(),
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        }
      }
    });
  } catch (error: any) {
    // Xử lý lỗi trùng lặp MongoDB (Code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message = field === 'username'
        ? 'Username này đã được sử dụng'
        : field === 'email'
        ? 'Email này đã được đăng ký'
        : 'Tài khoản đã tồn tại';

      res.status(400).json({
        success: false,
        message,
        data: null
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi đăng ký',
      data: null
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, account, usernameOrEmail, password } = req.body;

    // Hỗ trợ truyền qua username, email, account hoặc usernameOrEmail
    const loginIdentifier = username || email || account || usernameOrEmail;

    if (!loginIdentifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tài khoản (username hoặc email) và mật khẩu',
        data: null
      });
      return;
    }

    const normalizedIdentifier = String(loginIdentifier).trim().toLowerCase();

    // Tìm user theo username hoặc email
    const user = await User.findOne({
      $or: [
        { username: String(loginIdentifier).trim() },
        { email: normalizedIdentifier }
      ]
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác',
        data: null
      });
      return;
    }

    // So sánh mật khẩu
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(400).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác',
        data: null
      });
      return;
    }

    // Tạo JWT Token
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Trả về dữ liệu thành công (không có password)
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi đăng nhập',
      data: null
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng xác thực',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: {
        user: req.user
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi lấy thông tin người dùng',
      data: null
    });
  }
};
