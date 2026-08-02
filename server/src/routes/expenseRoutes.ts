import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Tất cả các route Expense đều yêu cầu xác thực JWT
router.use(authenticateJWT);

router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
