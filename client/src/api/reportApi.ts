import axiosClient from './axiosClient';
import { ApiResponse, DashboardData } from '../types';

export const reportApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await axiosClient.get<ApiResponse<DashboardData>>('/reports/dashboard');
    return response.data;
  },

  getMonthSummary: async (params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>('/reports/month-summary', {
      params
    });
    return response.data;
  },

  getCategorySummary: async (params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>('/reports/category-summary', {
      params
    });
    return response.data;
  },

  getYearSummary: async (params?: { year?: number }): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>('/reports/year-summary', {
      params
    });
    return response.data;
  }
};

export default reportApi;
