// service/SystemDetailsService.ts
import { axiosInstance } from "@/api/axiosInstance";

export interface SYSTEMDETAILS {
  ipId?: number;
  ipAddress?: string;
  systemName?: string;
  macAddress?: string;
  location?: string;
  description?: string;
  active?: "Y" | "N";
}

export type CreateSystemDetailsPayload = SYSTEMDETAILS;

export const SystemDetailsService = {
  // GET ALL
  getAll: async (): Promise<SYSTEMDETAILS[]> => {
    const { data } = await axiosInstance.get("/systemdetails/all");
    return data;
  },

  // GET BY ID
  getById: async (ipId: number): Promise<SYSTEMDETAILS> => {
    const { data } = await axiosInstance.get(
      `/systemdetails/${ipId}`
    );
    return data;
  },

  // CREATE
  create: async (
    payload: CreateSystemDetailsPayload
  ): Promise<SYSTEMDETAILS> => {
    const { data } = await axiosInstance.post(
      "/systemdetails/create",
      payload
    );
    return data;
  },

  // UPDATE
  update: async (
    payload: CreateSystemDetailsPayload
  ): Promise<SYSTEMDETAILS> => {
    const { data } = await axiosInstance.put(
      "/systemdetails/update",
      payload
    );
    return data;
  },

  // DELETE
  deleteById: async (ipId: number): Promise<string> => {
    const { data } = await axiosInstance.delete(
      `/systemdetails/delete/${ipId}`
    );
    return data;
  },
};