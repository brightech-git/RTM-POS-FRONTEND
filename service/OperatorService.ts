import { axiosInstance } from "@/api/axiosInstance";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface OperatorDTO {
  operCode?: number; // optional for register
  operName: string;
  password: string;
  active?: "Y" | "N";
  // Add other operator fields here
}

export interface LoginRequest {
  operCode: number;
  password: string;
}

export interface UpdatePasswordRequest {
  operCode: number;
  oldPassword: string;
  newPassword: string;
}

export const OperatorService = {
  register: async (payload: OperatorDTO): Promise<ApiResponse<string>> => {
    const { data } = await axiosInstance.post("/operator/register", payload);
    return data;
  },

  login: async (payload: LoginRequest): Promise<ApiResponse<string>> => {
    const { data } = await axiosInstance.post("/operator/login", payload);
    return data;
  },

  updatePassword: async (payload: UpdatePasswordRequest): Promise<ApiResponse<string>> => {
    const { data } = await axiosInstance.put("/operator/update-password", payload);
    return data;
  },

  deleteOperator: async (operCode: number): Promise<ApiResponse<string>> => {
    const { data } = await axiosInstance.delete(`/operator/delete/${operCode}`);
    return data;
  },
};