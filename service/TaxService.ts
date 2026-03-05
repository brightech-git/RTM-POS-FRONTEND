// service/TaxService.ts
import { axiosInstance } from "@/api/axiosInstance";

export interface Tax {
    TAXCODE?: number;
    TAXNAME: string;
    SHOTNAME: string;
    TAXPER: number;
    TAXTYPE: string;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
    SNO?: number;
}

export interface CreateTaxPayload {
    TAXNAME: string;
    SHOTNAME: string;
    TAXPER: number;
    TAXTYPE: string;
}

export const TaxService = {
    // GET ALL
    getAll: async (): Promise<Tax[]> => {
        const { data } = await axiosInstance.get("/tax/all");
        return data;
    },

    // GET BY ID
    getById: async (id: number): Promise<Tax> => {
        const { data } = await axiosInstance.get(`/tax/${id}`);
        return data;
    },

    // CREATE (payload only)
    create: async (payload: CreateTaxPayload): Promise<Tax> => {
        const { data } = await axiosInstance.post(
            "/tax/create",
            payload
        );
        return data;
    },

    // UPDATE
    updateById: async (
        id: number,
        payload: CreateTaxPayload
    ): Promise<Tax> => {
        const { data } = await axiosInstance.put(
            `/tax/update/${id}`,
            {
                TAXCODE: id,
                ...payload,
            }
        );
        return data;
    },

    // DELETE
    deleteById: async (id: number): Promise<string> => {
        const { data } = await axiosInstance.delete(
            `/tax/delete/${id}`
        );
        return data;
    },
};