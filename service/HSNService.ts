// service/HSNService.ts
import { axiosInstance } from "@/api/axiosInstance";

export interface HSN {

    HSNCODE: number;
    HSNDESCRIPTION: string;
    ACTIVE?: "Y" | "N";
    SNO?:number;
    CREATEDBY?:number;
    CREATEDDATE?:string;
    CREATEDTIME?:string;


}

export interface CreateHSNPayload {

    HSNCODE: string;
    HSNDESCRIPTION: string;
    ACTIVE?: "Y" | "N";

}

export interface HsnPayload {

    HSNCODE: number;
    HSNDESCRIPTION: string;
    ACTIVE?: "Y" | "N";

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
    create: async (payload: HsnPayload): Promise<HSN> => {
        const { data } = await axiosInstance.post(
            "/hsn/create",
            payload
        );
        return data;
    },

    // UPDATE
    updateByCode: async (
        code: string,
        payload: HsnPayload
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