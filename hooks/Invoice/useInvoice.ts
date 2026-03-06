import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllInvoiceDetails,
    getInvoiceDetailsById,
    createInvoiceDetails,
    updateInvoiceDetails,
    deleteInvoiceDetails,
} from "@/service/InvoiceService";

// GET ALL
export const useAllInvoiceDetails = () => {
    return useQuery({
        queryKey: ["invoiceDetails"],
        queryFn: getAllInvoiceDetails,
        staleTime: 1000 * 60 * 5,
    });
};

// GET BY ID
export const useInvoiceDetailsById = (id: string) => {
    return useQuery({
        queryKey: ["invoiceDetails", id],
        queryFn: () => getInvoiceDetailsById(id),
        enabled: !!id,
    });
};

// CREATE
export const useCreateInvoiceDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ invoice, createdBy }: any) =>
            createInvoiceDetails(invoice, createdBy),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoiceDetails"] });
        },
    });
};

// UPDATE
export const useUpdateInvoiceDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, invoice }: any) =>
            updateInvoiceDetails(id, invoice),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoiceDetails"] });
            queryClient.invalidateQueries({ queryKey: ["invoiceDetail"] });
        },
    });
};

// DELETE
export const useDeleteInvoiceDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteInvoiceDetails,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoiceDetails"] });
        },
    });
};