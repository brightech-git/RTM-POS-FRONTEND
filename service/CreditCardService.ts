import { axiosInstance } from "@/api/axiosInstance";
import { ApiResponse } from "@/types/api/apiResponse";
import { CreditCard, CreditCardCollection } from "@/types/CreditCard/CreditCard";

// GET ALL
export const getAllCreditCards = async (): Promise<ApiResponse<CreditCardCollection>> => {
    try {
        const response = await axiosInstance.get("/creditcard/all");
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// GET BY ID
export const getCreditCardById = async (id: number): Promise<ApiResponse<CreditCard>> => {
    try {
        const response = await axiosInstance.get(`/creditcard/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// CREATE
export const createCreditCard = async (
    data: CreditCard,
    createdBy: number
): Promise<ApiResponse<CreditCard>> => {
    try {
        const response = await axiosInstance.post("/creditcard/create", data, {
            headers: {
                CREATEDBY: createdBy
            }
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// UPDATE
export const updateCreditCard = async (
    data: CreditCard
): Promise<ApiResponse<CreditCard>> => {
    try {
        const response = await axiosInstance.put("/creditcard/update", data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// DELETE
export const deleteCreditCard = async (
    id: number
): Promise<ApiResponse<CreditCard>> => {
    try {
        const response = await axiosInstance.delete(`/creditcard/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};