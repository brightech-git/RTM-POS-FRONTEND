import { axiosInstance } from "@/api/axiosInstance";
import { SubProduct } from "@/types/subproduct/subproduct";

// GET ALL
export const getAllSubProducts = async () => {
    try {
        const { data } = await axiosInstance.get("/subproduct/all");
        return data;
    } catch (err) {
        console.warn("Error fetching subproducts", err);
        return err;
    }
};

// GET BY ID
// service/SubProductsService.ts
export const getSubProductById = async (id: number) => {
    try {
        // First get the subproduct
        const { data } = await axiosInstance.get(`/subproduct/${id}`);
        
        // If you need product details, you might need to make another API call
        // or your backend should return the product details
        
        console.log("SubProduct by ID response:", data); // Debug log
        return data;
    } catch (err) {
        console.warn("Error fetching subproduct", err);
        return err;
    }
};

// CREATE
export const createSubProduct = async (subProduct: SubProduct, createdBy: number) => {
    try {
        console.log("subProduct in service", subProduct);

        const { data } = await axiosInstance.post(
            "/subproduct/create",
            subProduct,
            {
                headers: {
                    CREATEDBY: createdBy
                }
            }
        );

        return data;
    } catch (err) {
        console.warn("Error creating subproduct", err);
        return err;
    }
};

// UPDATE
export const updateSubProduct = async (id: number, subProduct: SubProduct) => {
    try {
        const { data } = await axiosInstance.put(
            `/subproduct/update/${id}`,
            subProduct
        );

        return data;
    } catch (err) {
        console.warn("Error updating subproduct", err);
        return err;
    }
};

// DELETE
export const deleteSubProduct = async (id: number) => {
    try {
        const { data } = await axiosInstance.delete(
            `/subproduct/delete/${id}`
        );

        return data;
    } catch (err) {
        console.warn("Error deleting subproduct", err);
        return err;
    }
};