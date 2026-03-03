// service/ComputerService.ts
import { axiosInstance } from "@/api/axiosInstance";

export interface COMPUTER {
  ipId?: number;
  ipAddress?: string;
  systemName?: string;
  macAddress?: string;
  location?: string;
  description?: string;
  active?: "Y" | "N";
}

export type CreateComputerPayload = COMPUTER;

export const ComputerService = {
  // ================= GET ALL =================
  getAll: async (): Promise<COMPUTER[]> => {
    const { data } = await axiosInstance.get("/computer/all");
    return data;
  },

  // ================= GET BY ID =================
  getById: async (ipId: number): Promise<COMPUTER> => {
    const { data } = await axiosInstance.get(`/computer/${ipId}`);
    return data;
  },

  // ================= GET BY IP =================
  getByIp: async (ipAddress: string): Promise<COMPUTER> => {
    const { data } = await axiosInstance.get(
      `/computer/ip/${ipAddress}`
    );
    return data;
  },

  // ================= CREATE =================
  create: async (
    payload: CreateComputerPayload
  ): Promise<COMPUTER> => {
    const { data } = await axiosInstance.post(
      "/computer/create",
      payload
    );
    return data;
  },

  // ================= UPDATE =================
  update: async (
    payload: CreateComputerPayload
  ): Promise<COMPUTER> => {
    const { data } = await axiosInstance.put(
      "/computer/update",
      payload
    );
    return data;
  },

  // ================= DELETE =================
  deleteById: async (ipId: number): Promise<string> => {
    const { data } = await axiosInstance.delete(
      `/computer/delete/${ipId}`
    );
    return data;
  },
};