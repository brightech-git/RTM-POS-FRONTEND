import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    HSNLinkService,
    HSNLink,
    CreateHSNLinkPayload,
    UpdateHSNLinkPayload,
} from "@/service/HSNLinkService";
import {
    toastCreated,
    toastUpdated,
    toastError,
} from "@/component/toast/toast";

// ✅ GET ALL
export const useAllHSNLinks = () => {
    return useQuery<HSNLink[]>({
        queryKey: ["hsnlinks"],
        queryFn: HSNLinkService.getAll,
    });
};

// ✅ GET BY ID
export const useHSNLinkById = (id?: number) => {
    return useQuery<HSNLink>({
        queryKey: ["hsnlink", id],
        queryFn: () => HSNLinkService.getById(id!),
        enabled: !!id,
    });
};

// ✅ CREATE
export const useCreateHSNLink = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateHSNLinkPayload) =>
            HSNLinkService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsnlinks"] });
            toastCreated("HSN Link");
        },

        onError: (error: any) => {
            toastError("HSN Link", error?.message || "Failed to create HSN Link");
        },
    });
};

// ✅ UPDATE
export const useUpdateHSNLink = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: UpdateHSNLinkPayload;
        }) => HSNLinkService.updateById(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsnlinks"] });
            toastUpdated("HSN Link");
        },

        onError: (error: any) => {
            toastError("HSN Link", error?.message || "Failed to update HSN Link");
        },
    });
};

// ✅ DELETE
export const useDeleteHSNLink = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            HSNLinkService.deleteById(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hsnlinks"] });
            toastUpdated("HSN Link Deleted");
        },

        onError: (error: any) => {
            toastError("HSN Link", error?.message || "Failed to delete HSN Link");
        },
    });
};