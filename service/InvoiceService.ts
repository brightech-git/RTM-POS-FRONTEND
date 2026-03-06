import { axiosInstance } from "@/api/axiosInstance";
import { InvoiceDetails } from "@/types/Invoice/Invoice";

// GET ALL
export const getAllInvoiceDetails = async () => {
    try {
        const { data } = await axiosInstance.get("/invoice-details/all");
        return data;
    } catch (err) {
        console.warn("Error fetching invoice details", err);
        return err;
    }
};

// GET BY ID
export const getInvoiceDetailsById = async (id: string) => {
    try {
        const { data } = await axiosInstance.get(`/invoice-details/${id}`);

        console.log("InvoiceDetails by ID:", data);
        return data;
    } catch (err) {
        console.warn("Error fetching invoice details", err);
        return err;
    }
};

// CREATE
export const createInvoiceDetails = async (
    invoice: InvoiceDetails,
    createdBy: number
) => {
    try {
        console.log("InvoiceDetails in service", invoice);

        const { data } = await axiosInstance.post(
            "/invoice-details/create",
            invoice,
            {
                headers: {
                    CREATEDBY: createdBy,
                },
            }
        );

        return data;
    } catch (err) {
        console.warn("Error creating invoice details", err);
        return err;
    }
};

// UPDATE
export const updateInvoiceDetails = async (
    id: string,
    invoice: InvoiceDetails
) => {
    try {
        const { data } = await axiosInstance.put(
            `/invoice-details/update/${id}`,
            invoice
        );

        return data;
    } catch (err) {
        console.warn("Error updating invoice details", err);
        return err;
    }
};

// DELETE
export const deleteInvoiceDetails = async (id: string) => {
    try {
        const { data } = await axiosInstance.delete(
            `/invoice-details/delete/${id}`
        );

        return data;
    } catch (err) {
        console.warn("Error deleting invoice details", err);
        return err;
    }
};