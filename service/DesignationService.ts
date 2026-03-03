import { axiosInstance } from "@/api/axiosInstance";

/**
 * Must match backend response exactly (UPPERCASE)
 */
export interface Designation {
  DESIGNATIONCODE?: number;
  DESCRIPTION: string;
  ACTIVE: "Y" | "N";
  CREATEDBY?: number;
  CREATEDDATE?: string;
  CREATEDTIME?: string;
}

export const DesignationService = {
  // GET ALL
  getAll: async (): Promise<Designation[]> => {
    const { data } = await axiosInstance.get(
      "/designation/all"
    );
    return data;
  },

  // GET BY ID
  getById: async (code: number): Promise<Designation> => {
    const { data } = await axiosInstance.get(
      `/designation/${code}`
    );
    return data;
  },

  // CREATE
  create: async (
    payload: Pick<Designation, "DESCRIPTION" | "ACTIVE">
  ): Promise<Designation> => {
    const { data } = await axiosInstance.post(
      "/designation/create",
      payload
    );
    return data;
  },

  // UPDATE
  update: async (
    payload: Designation
  ): Promise<Designation> => {
    const { data } = await axiosInstance.put(
      "/designation/update",
      payload
    );
    return data;
  },

  // DELETE
  deleteById: async (code: number): Promise<string> => {
    const { data } = await axiosInstance.delete(
      `/designation/delete/${code}`
    );
    return data;
  },
};