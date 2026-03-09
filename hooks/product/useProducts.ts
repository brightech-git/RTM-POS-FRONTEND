
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProducts ,getAllActiveProducts , getProductById , createProduct ,updateProduct  } from "@/service/ProductService";


export const useAllProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: getAllProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

export const useActiveProducts = () => {
    return useQuery({
        queryKey: ["products", "active"],
        queryFn: getAllActiveProducts,
        staleTime: 1000 * 60 * 5,
    });
};

export const useProductById = (id: number) => {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => getProductById(id),
        enabled: !!id, // Only fetch if id exists
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["products", "active"] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProduct,
        onSuccess: (_,) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["products", "active"] });
            queryClient.invalidateQueries({ queryKey: ["product"] });
        },
    });
};

