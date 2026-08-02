export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPayload {
  name: string;
  icon?: string;
  color?: string;
  type?: string;
}

export interface Expense {
  _id: string;
  amount: number;
  expenseDate: string;
  note?: string;
  categoryId: string | Category;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  categoryId?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseFormPayload {
  amount: number;
  expenseDate: string;
  note?: string;
  categoryId: string;
}

export interface Budget {
  _id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetFormPayload {
  month: number;
  year: number;
  amount: number;
}

export interface CurrentBudgetInfo {
  budgetId: string | null;
  month: number;
  year: number;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  exceededAmount: number;
  usagePercent: number;
  status: 'NO_BUDGET' | 'NORMAL' | 'WARNING' | 'EXCEEDED';
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationInfo {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}
