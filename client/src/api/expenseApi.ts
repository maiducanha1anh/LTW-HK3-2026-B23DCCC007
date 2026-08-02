import axiosClient from './axiosClient';
import {
  ApiResponse,
  Expense,
  ExpenseFormPayload,
  ExpenseQueryParams,
  PaginationInfo
} from '../types';

export const expenseApi = {
  getExpenses: async (
    params?: ExpenseQueryParams
  ): Promise<ApiResponse<{ items: Expense[]; pagination: PaginationInfo }>> => {
    // Làm sạch params: loại bỏ các chuỗi rỗng để không gửi query param không cần thiết
    const cleanedParams: Record<string, any> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedParams[key] = value;
        }
      });
    }

    const response = await axiosClient.get<
      ApiResponse<{ items: Expense[]; pagination: PaginationInfo }>
    >('/expenses', { params: cleanedParams });

    return response.data;
  },

  getExpenseById: async (id: string): Promise<ApiResponse<Expense>> => {
    const response = await axiosClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (payload: ExpenseFormPayload): Promise<ApiResponse<Expense>> => {
    const response = await axiosClient.post<ApiResponse<Expense>>('/expenses', payload);
    return response.data;
  },

  updateExpense: async (
    id: string,
    payload: ExpenseFormPayload
  ): Promise<ApiResponse<Expense>> => {
    const response = await axiosClient.put<ApiResponse<Expense>>(`/expenses/${id}`, payload);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<ApiResponse<Expense>> => {
    const response = await axiosClient.delete<ApiResponse<Expense>>(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseApi;
