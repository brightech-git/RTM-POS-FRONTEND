// service/HSNService.ts
import { axiosInstance } from "@/api/axiosInstance";

export interface HSN {
    code: string;
    description: string;
    taxPercentage: number;
    createdDate?: string;
    createdTime?: string;
    sno?: number;
}

export interface CreateHSNPayload {
    code: string;
    description: string;
    taxPercentage: number;
}

export const HSNService = {
    // GET ALL
    getAll: async (): Promise<HSN[]> => {
        const { data } = await axiosInstance.get("/hsn/all");
        return data;
    },

    // GET BY CODE
    getById: async (code: string): Promise<HSN> => {
        const { data } = await axiosInstance.get(`/hsn/all/${code}`);
        return data;
    },

    // CREATE (CREATEDBY comes from axiosInstance header)
    create: async (payload: CreateHSNPayload): Promise<HSN> => {
        const { data } = await axiosInstance.post(
            "/hsn/create",
            payload
        );
        return data;
    },

    // UPDATE
    updateByCode: async (
        code: string,
        payload: CreateHSNPayload
    ): Promise<HSN> => {
        const { data } = await axiosInstance.put(
            `/hsn/update/${code}`,
            payload
        );
        return data;
    },

    // DELETE
    deleteByCode: async (code: string): Promise<string> => {
        const { data } = await axiosInstance.delete(
            `/hsn/delete/${code}`
        );
        return data;
    },
};