// service/InvoiceService.ts
import { axiosInstance } from "@/api/axiosInstance";
import { InvoiceDetails } from "@/types/Invoice/Invoice";

export const getAllInvoiceDetails = async () => {
    try {
        const { data } = await axiosInstance.get("/invoice-details/all");
        return data;
    } catch (error) {
        console.error("Error fetching invoice details:", error);
        throw error;
    }
};

export const getInvoiceDetailsById = async (id: string) => {
    try {
        const { data } = await axiosInstance.get(`/invoice-details/${id}`);
        return data;
    } catch (error) {
        console.error(`Error fetching invoice detail with id ${id}:`, error);
        throw error;
    }
};

// service/InvoiceService.ts
export const createInvoiceDetails = async (invoices: InvoiceDetails[]) => {
  try {
    const { data } = await axiosInstance.post(
      "/invoice-details/create",
      invoices // <-- raw array
    );
    return data;
  } catch (error) {
    console.error("Error creating invoice detail:", error);
    throw error;
  }
};

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
    } catch (error) {
        console.error(`Error updating invoice detail with id ${id}:`, error);
        throw error;
    }
};

export const deleteInvoiceDetails = async (id: string) => {
    try {
        const { data } = await axiosInstance.delete(
            `/invoice-details/delete/${id}`
        );
        return data;
    } catch (error) {
        console.error(`Error deleting invoice detail with id ${id}:`, error);
        throw error;
    }
};

export const previewRowSign = async (billType: string) => {
    try {
        const { data } = await axiosInstance.get(
            `/invoice-details/preview-rowsign`,
            {
                params: { billType }
            }
        );
        return data;
    } catch (error) {
        console.error("Error previewing row sign:", error);
        throw error;
    }
};