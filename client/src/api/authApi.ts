import axiosClient from './axiosClient';
import {
  ApiResponse,
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  User
} from '../types';

export interface LoginParams {
  account: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return response.data;
  },

  login: async (params: LoginParams): Promise<ApiResponse<AuthResponseData>> => {
    const { account, password } = params;
    const trimmedAccount = account.trim();

    let payload: LoginPayload;

    if (trimmedAccount.includes('@')) {
      payload = {
        email: trimmedAccount.toLowerCase(),
        password
      };
    } else {
      payload = {
        username: trimmedAccount,
        password
      };
    }

    const response = await axiosClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await axiosClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  }
};

export default authApi;
