import { Router } from 'express';
import {
  getMonthSummary,
  getCategorySummary,
  getYearSummary,
  getDashboard
} from '../controllers/reportController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Tất cả các route Report đều yêu cầu xác thực JWT
router.use(authenticateJWT);

router.get('/month-summary', getMonthSummary);
router.get('/category-summary', getCategorySummary);
router.get('/year-summary', getYearSummary);
router.get('/dashboard', getDashboard);

export default router;
