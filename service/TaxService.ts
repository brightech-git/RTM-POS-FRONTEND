// service/TaxService.ts
import { axiosInstance } from "@/api/axiosInstance";

export interface Tax {
    TAXCODE?: number;
    TAXNAME: string;
    SHOTNAME: string;
    TAXPER: number;
    TAXTYPE: string;
    CREATEDBY?: number;
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
        try {
            const { data } = await axiosInstance.get("/tax/all");
            return data;
        } catch (error: any) {
            throw new Error(
                error?.response?.data?.message || "Failed to fetch taxes"
            );
        }
    },

    // GET BY ID
    getById: async (id: number): Promise<Tax> => {
        try {
            const { data } = await axiosInstance.get(`/tax/${id}`);
            return data;
        } catch (error: any) {
            throw new Error(
                error?.response?.data?.message || "Failed to fetch tax"
            );
        }
    },

    // CREATE
    create: async (
        payload: CreateTaxPayload,
        createdBy: number
    ): Promise<Tax> => {
        try {
            const { data } = await axiosInstance.post(
                "/tax/create",
                payload,
                {
                    headers: {
                        CREATEDBY: createdBy,
                        "Content-Type": "application/json",
                    },
                }
            );
            return data;
        } catch (error: any) {
            throw new Error(
                error?.response?.data?.message || "Failed to create tax"
            );
        }
    },

    // UPDATE
// UPDATE
updateById: async (
    id: number,
    payload: CreateTaxPayload
): Promise<Tax> => {
    try {
        const { data } = await axiosInstance.put(
            `/tax/update/${id}`,   // ✅ CORRECT
            {
                TAXCODE: id,
                ...payload,
            }
        );
        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to update tax"
        );
    }
},

    // DELETE
    deleteById: async (id: number): Promise<string> => {
        try {
            const { data } = await axiosInstance.delete(
                `/tax/delete/${id}`
            );
            return data;
        } catch (error: any) {
            throw new Error(
                error?.response?.data?.message || "Failed to delete tax"
            );
        }
    },
};