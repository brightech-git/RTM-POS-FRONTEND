import { axiosInstance } from "@/api/axiosInstance";
import { Barcode } from "@/types/OrionBarcode/OrionBarcode";

export const getAllBarcodes = async () => {
    const { data } = await axiosInstance.get("/barcode/all");
    return data;
};

export const getBarcodeById = async (id: number) => {
    const { data } = await axiosInstance.get(`/barcode/${id}`);
    return data;
};

export const createBarcode = async (barcode: Barcode, createdBy: number) => {
    const { data } = await axiosInstance.post(
        "/barcode/create",
        barcode,
        {
            headers: {
                CREATEDBY: createdBy
            }
        }
    );
    return data;
};

export const updateBarcode = async (barcode: Barcode) => {
    const { data } = await axiosInstance.put("/barcode/update", barcode);
    return data;
};

export const deleteBarcode = async (id: number) => {
    const { data } = await axiosInstance.delete(`/barcode/delete/${id}`);
    return data;
};