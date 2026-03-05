import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllSubProducts,
    getSubProductById,
    createSubProduct,
    updateSubProduct,
    deleteSubProduct
} from "@/service/SubProductsService";

// GET ALL
export const useAllSubProducts = () => {
    return useQuery({
        queryKey: ["subproducts"],
        queryFn: getAllSubProducts,
        staleTime: 1000 * 60 * 5,
    });
};

// GET BY ID
export const useSubProductById = (id: number) => {
    return useQuery({
        queryKey: ["subproduct", id],
        queryFn: () => getSubProductById(id),
        enabled: !!id,
    });
};

// CREATE
export const useCreateSubProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ subProduct, createdBy }: any) =>
            createSubProduct(subProduct, createdBy),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subproducts"] });
        },
    });
};

// UPDATE
export const useUpdateSubProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, subProduct }: any) =>
            updateSubProduct(id, subProduct),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subproducts"] });
            queryClient.invalidateQueries({ queryKey: ["subproduct"] });
        },
    });
};

// DELETE
export const useDeleteSubProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSubProduct,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subproducts"] });
        },
    });
};