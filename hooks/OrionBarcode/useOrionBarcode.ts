import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllBarcodes,
    getBarcodeById,
    createBarcode,
    updateBarcode,
    deleteBarcode
} from "@/service/OrionBarcodeService";

export const useAllBarcodes = () => {
    return useQuery({
        queryKey: ["barcodes"],
        queryFn: getAllBarcodes,
        staleTime: 1000 * 60 * 5
    });
};

export const useBarcodeById = (id: number) => {
    return useQuery({
        queryKey: ["barcode", id],
        queryFn: () => getBarcodeById(id),
        enabled: !!id
    });
};

export const useCreateBarcode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ barcode, createdBy }: { barcode: any; createdBy: number }) =>
            createBarcode(barcode, createdBy),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["barcodes"] });
        }
    });
};

export const useUpdateBarcode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBarcode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["barcodes"] });
            queryClient.invalidateQueries({ queryKey: ["barcode"] });
        }
    });
};

export const useDeleteBarcode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBarcode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["barcodes"] });
        }
    });
};