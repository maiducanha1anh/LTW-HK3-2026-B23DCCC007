import axiosClient from './axiosClient';
import {
  ApiResponse,
  Budget,
  BudgetFormPayload,
  CurrentBudgetInfo
} from '../types';

export const budgetApi = {
  getBudgets: async (): Promise<ApiResponse<Budget[]>> => {
    const response = await axiosClient.get<ApiResponse<Budget[]>>('/budgets');
    return response.data;
  },

  getCurrentBudget: async (params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<CurrentBudgetInfo>> => {
    const response = await axiosClient.get<ApiResponse<CurrentBudgetInfo>>('/budgets/current', {
      params
    });
    return response.data;
  },

  getBudgetById: async (id: string): Promise<ApiResponse<Budget>> => {
    const response = await axiosClient.get<ApiResponse<Budget>>(`/budgets/${id}`);
    return response.data;
  },

  createBudget: async (payload: BudgetFormPayload): Promise<ApiResponse<Budget>> => {
    const response = await axiosClient.post<ApiResponse<Budget>>('/budgets', payload);
    return response.data;
  },

  updateBudget: async (
    id: string,
    payload: BudgetFormPayload
  ): Promise<ApiResponse<Budget>> => {
    const response = await axiosClient.put<ApiResponse<Budget>>(`/budgets/${id}`, payload);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<ApiResponse<Budget>> => {
    const response = await axiosClient.delete<ApiResponse<Budget>>(`/budgets/${id}`);
    return response.data;
  }
};

export default budgetApi;
