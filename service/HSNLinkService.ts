import { axiosInstance } from "@/api/axiosInstance";

export interface HSNLink {
    PRODUCTCODE?: number;
    HSNCODE: number;
    ACTIVE: "Y" | "N";
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
    HSNDESCRIPTION?: string; // For enriched display
    PRODUCTNAME?: string; // For enriched display
}

export interface CreateHSNLinkPayload {
    HSNCODE: number;
    ACTIVE: "Y" | "N";
}

export interface UpdateHSNLinkPayload {
    PRODUCTCODE: number;
    HSNCODE: number;
    ACTIVE: "Y" | "N";
}

export const HSNLinkService = {
    // GET ALL
    getAll: async (): Promise<HSNLink[]> => {
        const { data } = await axiosInstance.get("/hsnlink/all");
        return data;
    },

    // GET BY ID
    getById: async (id: number): Promise<HSNLink> => {
        const { data } = await axiosInstance.get(`/hsnlink/${id}`);
        return data;
    },

    // CREATE
    create: async (
        payload: CreateHSNLinkPayload
    ): Promise<HSNLink> => {
        const { data } = await axiosInstance.post(
            "/hsnlink/create-multiple",
            payload
        );
        return data;
    },

    // UPDATE
    updateById: async (
        id: number,
        payload: UpdateHSNLinkPayload
    ): Promise<HSNLink> => {
        const { data } = await axiosInstance.put(
            `/hsnlink/update/${id}`,
            payload
        );
        return data;
    },

    // DELETE
    deleteById: async (id: number): Promise<string> => {
        const { data } = await axiosInstance.delete(
            `/hsnlink/delete/${id}`
        );
        return data;
    },
};