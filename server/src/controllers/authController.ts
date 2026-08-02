import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_BASE64_REGEX = /^data:image\/(png|jpeg|jpg|webp);base64,/;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET chưa được cấu hình trên máy chủ');
  }
  return secret;
};

// Chuẩn hóa cấu trúc User response đồng bộ cho GET /me và PUT /profile
const formatUserResponse = (user: IUser) => {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone || '',
    gender: user.gender || '',
    birthDate: user.birthDate || null,
    address: user.address || '',
    occupation: user.occupation || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
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
        user: formatUserResponse(newUser)
      }
    });
  } catch (error: any) {
    // Xử lý lỗi trùng lặp MongoDB (Code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message =
        field === 'username'
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
        user: formatUserResponse(user)
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
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng xác thực',
        data: null
      });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: {
        user: formatUserResponse(user)
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

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng xác thực',
        data: null
      });
      return;
    }

    // Tách CHÍNH XÁC các field được phép sửa
    const { fullName, phone, gender, birthDate, address, occupation, bio, avatar } =
      req.body;

    const updateData: Record<string, any> = {};

    // Validate & Normalize fullName
    if (fullName !== undefined) {
      const trimmedFullName = String(fullName).trim();
      if (!trimmedFullName) {
        res.status(400).json({
          success: false,
          message: 'Họ và tên không được để rỗng',
          data: null
        });
        return;
      }
      updateData.fullName = trimmedFullName;
    }

    // Validate & Normalize phone
    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();
      if (trimmedPhone !== '') {
        if (!/^\d{9,11}$/.test(trimmedPhone)) {
          res.status(400).json({
            success: false,
            message: 'Số điện thoại phải từ 9 đến 11 chữ số',
            data: null
          });
          return;
        }
        updateData.phone = trimmedPhone;
      } else {
        updateData.phone = '';
      }
    }

    // Validate & Normalize gender
    if (gender !== undefined) {
      const trimmedGender = String(gender).trim();
      if (trimmedGender !== '') {
        if (!['male', 'female', 'other'].includes(trimmedGender)) {
          res.status(400).json({
            success: false,
            message: 'Giới tính chỉ nhận male, female hoặc other',
            data: null
          });
          return;
        }
        updateData.gender = trimmedGender;
      } else {
        updateData.gender = '';
      }
    }

    // Validate & Normalize birthDate
    if (birthDate !== undefined) {
      if (birthDate === null || birthDate === '') {
        updateData.birthDate = null;
      } else {
        const parsedDate = new Date(birthDate);
        if (isNaN(parsedDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'Ngày sinh không hợp lệ',
            data: null
          });
          return;
        }
        if (parsedDate > new Date()) {
          res.status(400).json({
            success: false,
            message: 'Ngày sinh không được lớn hơn ngày hiện tại',
            data: null
          });
          return;
        }
        updateData.birthDate = parsedDate;
      }
    }

    // Validate & Normalize address
    if (address !== undefined) {
      updateData.address = String(address).trim();
    }

    // Validate & Normalize occupation
    if (occupation !== undefined) {
      updateData.occupation = String(occupation).trim();
    }

    // Validate & Normalize bio
    if (bio !== undefined) {
      const trimmedBio = String(bio).trim();
      if (trimmedBio.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Ghi chú cá nhân không được vượt quá 500 ký tự',
          data: null
        });
        return;
      }
      updateData.bio = trimmedBio;
    }

    // Validate & Normalize avatar
    if (avatar !== undefined) {
      if (avatar === null || avatar === '') {
        updateData.avatar = '';
      } else {
        const avatarStr = String(avatar).trim();
        if (avatarStr !== '') {
          if (!AVATAR_BASE64_REGEX.test(avatarStr)) {
            res.status(400).json({
              success: false,
              message:
                'Định dạng avatar không hỗ trợ. Vui lòng chọn PNG, JPG, JPEG hoặc WEBP dạng Base64',
              data: null
            });
            return;
          }
          // Giới hạn 2.8MB chuỗi Base64 (~2MB file size)
          if (avatarStr.length > 2.8 * 1024 * 1024) {
            res.status(400).json({
              success: false,
              message: 'Dung lượng avatar vượt quá 2MB',
              data: null
            });
            return;
          }
          updateData.avatar = avatarStr;
        } else {
          updateData.avatar = '';
        }
      }
    }

    // Cập nhật Mongoose User Document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: {
        user: formatUserResponse(updatedUser)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi cập nhật thông tin cá nhân',
      data: null
    });
  }
};
