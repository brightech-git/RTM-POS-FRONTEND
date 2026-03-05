import { axiosInstance } from "@/api/axiosInstance";
import { Vendor } from "@/types/vendor/vendor";

// GET ALL
export const getAllVendors = async (): Promise<Vendor[]> => {
    try {
        const { data } = await axiosInstance.get("/vendor/all");
        return data;
    } catch (err) {
        console.warn("Error fetching vendors", err);
        throw err; // Throw error instead of returning it
    }
};

// GET BY ID
export const getVendorById = async (id: number): Promise<Vendor> => {
    try {
        const { data } = await axiosInstance.get(`/vendor/${id}`);
        return data;
    } catch (err) {
        console.warn("Error fetching vendor", err);
        throw err;
    }
};

// CREATE
export const createVendor = async ({ vendor, createdBy }: { vendor: Vendor, createdBy?: number }): Promise<Vendor> => {
    try {
        const { data } = await axiosInstance.post(
            "/vendor/create",
            vendor,
            {
                headers: {
                    CREATEDBY: createdBy
                }
            }
        );
        return data;
    } catch (err) {
        console.warn("Error creating vendor", err);
        throw err;
    }
};

// UPDATE
export const updateVendor = async (vendor: Vendor): Promise<Vendor> => {
    try {
        const { data } = await axiosInstance.put("/vendor/update", vendor);
        return data;
    } catch (err) {
        console.warn("Error updating vendor", err);
        throw err;
    }
};

// DELETE
export const deleteVendor = async (id: number): Promise<void> => {
    try {
        const { data } = await axiosInstance.delete(`/vendor/delete/${id}`);
        return data;
    } catch (err) {
        console.warn("Error deleting vendor", err);
        throw err;
    }
};