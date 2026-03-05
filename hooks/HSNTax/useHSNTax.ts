import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    HSNTaxService,
    HSNTax,
    CreateHSNTaxPayload,
    UpdateHSNTaxPayload,
} from "@/service/HSNTaxService";
import {
    toastCreated,
    toastUpdated,
    toastError,
} from "@/component/toast/toast";

/* -------------------- GET ALL -------------------- */

export const useAllHSNTax = () => {
    return useQuery<HSNTax[]>({
        queryKey: ["hsn-tax"],
        queryFn: HSNTaxService.getAll,
    });
};

/* -------------------- GET BY ID -------------------- */

export const useHSNTaxById = (id?: number) => {
    return useQuery<HSNTax>({
        queryKey: ["hsn-tax", id],
        queryFn: () => HSNTaxService.getById(id!),
        enabled: !!id,
    });
};

/* -------------------- CREATE -------------------- */

export const useCreateHSNTax = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateHSNTaxPayload) =>
            HSNTaxService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsn-tax"] });
            toastCreated("HSN Tax");
        },

        onError: (error: any) => {
            toastError(
                "HSN Tax",
                error?.response?.data?.message || "Failed to create HSN Tax"
            );
        },
    });
};

/* -------------------- UPDATE -------------------- */

export const useUpdateHSNTax = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateHSNTaxPayload) =>
            HSNTaxService.update(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsn-tax"] });
            toastUpdated("HSN Tax");
        },

        onError: (error: any) => {
            toastError(
                "HSN Tax",
                error?.response?.data?.message || "Failed to update HSN Tax"
            );
        },
    });
};

/* -------------------- DELETE -------------------- */

export const useDeleteHSNTax = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            HSNTaxService.deleteById(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsn-tax"] });
            toastUpdated("HSN Tax Deleted");
        },

        onError: (error: any) => {
            toastError(
                "HSN Tax",
                error?.response?.data?.message || "Failed to delete HSN Tax"
            );
        },
    });
};