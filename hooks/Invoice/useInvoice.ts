import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceDetails } from "@/types/Invoice/Invoice";

import {
    getAllInvoiceDetails,
    getInvoiceDetailsById,
    createInvoiceDetails,
    updateInvoiceDetails,
    deleteInvoiceDetails,
    previewRowSign
} from "@/service/InvoiceService";

export const useAllInvoiceDetails = () => {
    return useQuery({
        queryKey: ["invoice-details"],
        queryFn: getAllInvoiceDetails,
        staleTime: 1000 * 60 * 5
    });
};

export const useInvoiceDetailsById = (id: string) => {
    return useQuery({
        queryKey: ["invoice-details", id],
        queryFn: () => getInvoiceDetailsById(id),
        enabled: !!id
    });
};

// hooks/useInvoice.ts
export const useCreateInvoiceDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn now directly takes an array of InvoiceDetails
    mutationFn: (invoices: InvoiceDetails[]) => createInvoiceDetails(invoices),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-details"] });
    },
  });
};

export const useUpdateInvoiceDetails = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, invoice }: { id: string; invoice: any }) =>
            updateInvoiceDetails(id, invoice),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoice-details"] });
        }
    });
};

export const useDeleteInvoiceDetails = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteInvoiceDetails,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoice-details"] });
        }
    });
};

export const usePreviewRowSign = (billType: string) => {
    return useQuery({
        queryKey: ["preview-rowsign", billType],
        queryFn: () => previewRowSign(billType),
        enabled: !!billType
    });
};