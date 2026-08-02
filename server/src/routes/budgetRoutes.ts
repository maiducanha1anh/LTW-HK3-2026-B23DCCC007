import { Router } from 'express';
import {
  getBudgets,
  getCurrentBudget,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Tất cả các route Budget đều yêu cầu xác thực JWT
router.use(authenticateJWT);

router.get('/', getBudgets);
router.get('/current', getCurrentBudget); // Đăng ký trước /:id
router.get('/:id', getBudgetById);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
