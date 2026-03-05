import { axiosInstance } from "@/api/axiosInstance";
import { Rate } from "@/types/Rate/Rate";

// GET ALL
export const getAllRates = async () => {
    try {
        const { data } = await axiosInstance.get("/rate/all");
        return data;
    } catch (err) {
        console.warn("Error fetching rates", err);
        return err;
    }
};

// GET BY ID
export const getRateById = async (id: number) => {
    try {
        const { data } = await axiosInstance.get(`/rate/${id}`);
        return data;
    } catch (err) {
        console.warn("Error fetching rate", err);
        return err;
    }
};

// CREATE
export const createRate = async (
    rate: Rate,
    productCode: number,
    subProductCode?: number,
    createdBy?: number
) => {
    try {
        const url = subProductCode
            ? `/rate/create/${productCode}?subProductCode=${subProductCode}`
            : `/rate/create/${productCode}`;

        const { data } = await axiosInstance.post(url, rate, {
            headers: {
                CREATEDBY: createdBy
            }
        });

        return data;
    } catch (err) {
        console.warn("Error creating rate", err);
        return err;
    }
};

// UPDATE
export const updateRate = async (rate: Rate) => {
    try {
        const { data } = await axiosInstance.put("/rate/update", rate);
        return data;
    } catch (err) {
        console.warn("Error updating rate", err);
        return err;
    }
};

// DELETE
export const deleteRate = async (id: number) => {
    try {
        const { data } = await axiosInstance.delete(`/rate/delete/${id}`);
        return data;
    } catch (err) {
        console.warn("Error deleting rate", err);
        return err;
    }
};