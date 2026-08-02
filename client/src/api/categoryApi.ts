import axiosClient from './axiosClient';
import { ApiResponse, Category, CategoryPayload } from '../types';

export const categoryApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await axiosClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (payload: CategoryPayload): Promise<ApiResponse<Category>> => {
    const response = await axiosClient.post<ApiResponse<Category>>('/categories', payload);
    return response.data;
  },

  updateCategory: async (id: string, payload: CategoryPayload): Promise<ApiResponse<Category>> => {
    const response = await axiosClient.put<ApiResponse<Category>>(`/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await axiosClient.delete<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }
};

export default categoryApi;
