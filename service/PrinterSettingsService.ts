import { axiosInstance } from "@/api/axiosInstance";

export interface Printer {
    PRINTCODE?: number;
    IPADDRESS: string;
    IPID: number;
    PRINTERNAME: string;
    EXENAME: string;
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

export interface CreatePrinterPayload {
    IPADDRESS: string;
    IPID: number;
    PRINTERNAME: string;
    EXENAME: string;
}

export interface UpdatePrinterPayload {
    PRINTCODE: number;
    IPADDRESS: string;
    IPID: number;
    PRINTERNAME: string;
    EXENAME: string;
}

export const PrinterService = {
    // ✅ GET ALL
    getAll: async (): Promise<Printer[]> => {
        const { data } = await axiosInstance.get("/printer/all");
        return data;
    },

    // ✅ GET BY ID
    getById: async (id: number): Promise<Printer> => {
        const { data } = await axiosInstance.get(`/printer/${id}`);
        return data;
    },

    // ✅ CREATE
    create: async (
        payload: CreatePrinterPayload
    ): Promise<Printer> => {
        const { data } = await axiosInstance.post(
            "/printer/create",
            payload,
            {
                headers: {
                    CREATEDBY: 1, // replace with logged user id
                },
            }
        );
        return data;
    },

    // ✅ UPDATE
    updateById: async (
        id: number,
        payload: UpdatePrinterPayload
    ): Promise<Printer> => {
        const { data } = await axiosInstance.put(
            `/printer/update/${id}`,
            payload
        );
        return data;
    },

    // ✅ DELETE
    deleteById: async (id: number): Promise<string> => {
        const { data } = await axiosInstance.delete(
            `/printer/delete/${id}`
        );
        return data;
    },
};