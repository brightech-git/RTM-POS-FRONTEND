import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllCreditCards,
    getCreditCardById,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard
} from "@/service/CreditCardService";


// GET ALL
export const useAllCreditCards = () => {
    return useQuery({
        queryKey: ["creditcards"],
        queryFn: getAllCreditCards,
        staleTime: 1000 * 60 * 5,
    });
};


// GET BY ID
export const useCreditCardById = (id: number) => {
    return useQuery({
        queryKey: ["creditcard", id],
        queryFn: () => getCreditCardById(id),
        enabled: !!id,
    });
};


// CREATE
export const useCreateCreditCard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, createdBy }: any) =>
            createCreditCard(data, createdBy),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["creditcards"] });
        },
    });
};


// UPDATE
export const useUpdateCreditCard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCreditCard,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["creditcards"] });
            queryClient.invalidateQueries({ queryKey: ["creditcard"] });
        },
    });
};


// DELETE
export const useDeleteCreditCard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCreditCard,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["creditcards"] });
        },
    });
};