import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { IUserPayload } from '../types/express';

interface IDecodedToken {
  id: string;
  iat?: number;
  exp?: number;
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'JWT_SECRET chưa được cấu hình trên máy chủ',
        data: null
      });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Không tìm thấy Token xác thực (Bearer Token)',
        data: null
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token xác thực không hợp lệ',
        data: null
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as IDecodedToken;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị xóa',
        data: null
      });
      return;
    }

    // Attach clean user payload object without full Mongoose document
    const userPayload: IUserPayload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName
    };

    req.user = userPayload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      data: null
    });
  }
};
