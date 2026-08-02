import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import categoryReducer from '../features/categories/categorySlice';
import expenseReducer from '../features/expenses/expenseSlice';
import budgetReducer from '../features/budgets/budgetSlice';
import reportReducer from '../features/reports/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    expenses: expenseReducer,
    budgets: budgetReducer,
    reports: reportReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
