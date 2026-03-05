import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor
} from "@/service/VendorService";
import { Vendor } from "@/types/vendor/vendor";

// GET ALL
export const useAllVendors = () => {
    return useQuery({
        queryKey: ["vendors"],
        queryFn: getAllVendors,
        staleTime: 1000 * 60 * 5
    });
};

// GET BY ID
export const useVendorById = (id: number) => {
    return useQuery({
        queryKey: ["vendor", id],
        queryFn: () => getVendorById(id),
        enabled: !!id && id > 0
    });
};

// CREATE
export const useCreateVendor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ vendor, createdBy }: { vendor: Vendor, createdBy?: number }) =>
            createVendor({ vendor, createdBy }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors"] });
        }
    });
};

// UPDATE
export const useUpdateVendor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateVendor,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["vendors"] });
            queryClient.invalidateQueries({ queryKey: ["vendor", variables.VENDORCODE] });
        }
    });
};

// DELETE
export const useDeleteVendor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors"] });
        }
    });
};