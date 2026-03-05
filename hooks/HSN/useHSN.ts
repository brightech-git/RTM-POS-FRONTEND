// hooks/hsn/useHSN.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HSNService, HSN, CreateHSNPayload } from "@/service/HSNService";
import { toastCreated, toastUpdated, toastError } from "@/component/toast/toast";


// GET ALL HSN
export const useAllHSN = () => {
    return useQuery<HSN[]>({
        queryKey: ["hsn"],
        queryFn: HSNService.getAll,
    });
};


// GET HSN BY CODE
export const useHSNByCode = (code?: string) => {
    return useQuery<HSN>({
        queryKey: ["hsn", code],
        queryFn: () => HSNService.getById(code!),
        enabled: !!code,
    });
};


// CREATE HSN
export const useCreateHSN = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateHSNPayload) =>
            HSNService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsn"] });
            toastCreated("HSN");
        },

        onError: (error: any) => {
            toastError("HSN", error?.message || "Failed to create HSN");
        },
    });
};


// UPDATE HSN
export const useUpdateHSN = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            code,
            payload,
        }: {
            code: string;
            payload: CreateHSNPayload;
        }) =>
            HSNService.updateByCode(code, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsn"] });
            toastUpdated("HSN");
        },

        onError: (error: any) => {
            toastError("HSN", error?.message || "Failed to update HSN");
        },
    });
};


// DELETE HSN
export const useDeleteHSN = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (code: string) =>
            HSNService.deleteByCode(code),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsn"] });
            toastUpdated("HSN Deleted");
        },

        onError: (error: any) => {
            toastError("HSN", error?.message || "Failed to delete HSN");
        },
    });
};