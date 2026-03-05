import { axiosInstance } from "@/api/axiosInstance";

/* -------------------- TYPES -------------------- */

export interface HSNTax {
    HSNTAXCODE?: number;
    HSNCODE: string;
    BELOWSALESAMOUNT: number;
    BELOWSGSTTAXCODE: number;
    BELOWCGSTTAXCODE: number;
    BELOWIGSTTAXCODE: number;
    BELOWSRVTAXCODE: number;
    ABOVESGSTTAXCODE: number;
    ABOVECGSTTAXCODE: number;
    ABOVEIGSTTAXCODE: number;
    ABOVESRVTAXCODE: number;
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

export interface CreateHSNTaxPayload {
    HSNCODE: string;
    BELOWSALESAMOUNT: number;
    BELOWSGSTTAXCODE: number;
    BELOWCGSTTAXCODE: number;
    BELOWIGSTTAXCODE: number;
    BELOWSRVTAXCODE: number;
    ABOVESGSTTAXCODE: number;
    ABOVECGSTTAXCODE: number;
    ABOVEIGSTTAXCODE: number;
    ABOVESRVTAXCODE: number;
}

export interface UpdateHSNTaxPayload {
    HSNTAXCODE: number;
    HSNCODE: string;
    BELOWSALESAMOUNT: number;
    BELOWSGSTTAXCODE: number;
    BELOWCGSTTAXCODE: number;
    BELOWIGSTTAXCODE: number;
    BELOWSRVTAXCODE: number;
    ABOVESGSTTAXCODE: number;
    ABOVECGSTTAXCODE: number;
    ABOVEIGSTTAXCODE: number;
    ABOVESRVTAXCODE: number;
}

/* -------------------- SERVICE -------------------- */

export const HSNTaxService = {

    // ✅ GET ALL
    getAll: async (): Promise<HSNTax[]> => {
        try {
            const { data } = await axiosInstance.get("/hsn-tax/all");
            return data || [];
        } catch (error: any) {
            if (error?.response?.status === 204) {
                return [];
            }
            throw error;
        }
    },

    // ✅ GET BY ID
    getById: async (id: number): Promise<HSNTax> => {
        const { data } = await axiosInstance.get(`/hsn-tax/${id}`);
        return data;
    },

    // ✅ CREATE
    create: async (
        payload: CreateHSNTaxPayload
    ): Promise<HSNTax> => {
        const { data } = await axiosInstance.post(
            "/hsn-tax/create",
            payload,
            {
                headers: {
                    CREATEDBY: 1, // 🔥 replace with logged user id
                },
            }
        );
        return data;
    },

    // ✅ UPDATE (NO ID IN URL)
    update: async (
        payload: UpdateHSNTaxPayload
    ): Promise<HSNTax> => {
        const { data } = await axiosInstance.put(
            "/hsn-tax/update",
            payload
        );
        return data;
    },

    // ✅ DELETE
    deleteById: async (id: number): Promise<string> => {
        const { data } = await axiosInstance.delete(
            `/hsn-tax/delete/${id}`
        );
        return data;
    },
};