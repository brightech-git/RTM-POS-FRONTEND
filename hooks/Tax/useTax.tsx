// hooks/tax/useTax.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaxService, Tax, CreateTaxPayload } from "@/service/TaxService";
import { toastCreated, toastError, toastUpdated } from "@/component/toast/toast";

// GET ALL TAX
export const useAllTaxes = () => {
    return useQuery<Tax[]>({
        queryKey: ["taxes"],
        queryFn: TaxService.getAll,
    });
};

// GET TAX BY ID
export const useTaxById = (taxId?: number) => {
    return useQuery<Tax>({
        queryKey: ["tax", taxId],
        queryFn: () => TaxService.getById(taxId!),
        enabled: !!taxId,
    });
};

// CREATE TAX
export const useCreateTax = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateTaxPayload) =>
            TaxService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["taxes"] });
            toastCreated("Tax");
        },

        onError: (error: any) => {
            toastError("Tax", error?.message || "Failed to create tax");
        },
    });
};

// UPDATE TAX
export const useUpdateTax = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: CreateTaxPayload;
        }) => TaxService.updateById(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["taxes"] });
            toastUpdated("Tax");
        },

        onError: (error: any) => {
            toastError("Tax", error.message);
        },
    });
};

// DELETE TAX
export const useDeleteTax = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => TaxService.deleteById(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["taxes"] });
            toastUpdated("Tax Deleted");
        },

        onError: (error: any) => {
            toastError("Tax", error.message);
        },
    });
};