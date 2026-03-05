import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllRates,
    getRateById,
    createRate,
    updateRate,
    deleteRate
} from "@/service/RateService";

// GET ALL
export const useAllRates = () => {
    return useQuery({
        queryKey: ["rates"],
        queryFn: getAllRates,
        staleTime: 1000 * 60 * 5,
    });
};

// GET BY ID
export const useRateById = (id: number) => {
    return useQuery({
        queryKey: ["rate", id],
        queryFn: () => getRateById(id),
        enabled: !!id,
    });
};

// CREATE
export const useCreateRate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ rate, productCode, subProductCode, createdBy }: any) =>
            createRate(rate, productCode, subProductCode, createdBy),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rates"] });
        },
    });
};

// UPDATE
export const useUpdateRate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateRate,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rates"] });
            queryClient.invalidateQueries({ queryKey: ["rate"] });
        },
    });
};

// DELETE
export const useDeleteRate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteRate,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rates"] });
        },
    });
};