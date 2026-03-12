// service/CompanyService.ts
import { axiosInstance } from "@/api/axiosInstance";

export interface Company {
  COMPANYCODE: string;
  COMPANYNAME: string;
  COMPANYSHORTNAME?: string;
  ADDRESS1?: string;
  ADDRESS2?: string;
  ADDRESS3?: string;
  AREA?: string;
  CITY?: string;
  AREACODE?: string;
  PINCODE?: string;
  PHONE?: string;
  MOBILENO?: string;
  EMAIL?: string;
  GSTNO?: string;
  GSTTINNO?: string;
  ACTIVE?: "Y" | "N";
  STATEID?: string;
  LOGO?: string;
  CREATEDDATE?: string;
  CREATEDTIME?: string;
  PASSWORD?: string;
  PORTNO?: string;
  SERVERNAME?: string;
  USERID?: string;
  id?: number;
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: "success" | "error"; // include the allowed status values
}

export const CompanyService = {
  // Get All Companies
  getAll: async (): Promise<Company[]> => {
    const { data } = await axiosInstance.get("/company/all");
    return data;
  },

  // Get Company By Code
  getByCode: async (code: string): Promise<{ data: Company }> => {
    const { data } = await axiosInstance.get(`/company/${code}`);
    return data;
  },

  // Create Company
  create: async (payload: Partial<Company>): Promise<{ data: Company }> => {
    const { data } = await axiosInstance.post("/company/create", payload);
    return data;
  },

  // Update Company
  update: async (payload: Partial<Company>): Promise<{ data: Company }> => {
    const { data } = await axiosInstance.put("/company/update", payload);
    return data;
  },

  // Delete Company
  delete: async (code: string): Promise<{ data: string }> => {
    const { data } = await axiosInstance.delete(`/company/delete/${code}`);
    return data;
  },
};