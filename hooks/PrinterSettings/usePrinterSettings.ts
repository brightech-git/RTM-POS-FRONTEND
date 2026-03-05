import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    PrinterService,
    Printer,
    CreatePrinterPayload,
    UpdatePrinterPayload,
} from "@/service/PrinterSettingsService";
import {
    toastCreated,
    toastUpdated,
    toastError,
} from "@/component/toast/toast";

// ✅ GET ALL
export const useAllPrinters = () => {
    return useQuery<Printer[]>({
        queryKey: ["printers"],
        queryFn: PrinterService.getAll,
    });
};

// ✅ GET BY ID
export const usePrinterById = (id?: number) => {
    return useQuery<Printer>({
        queryKey: ["printer", id],
        queryFn: () => PrinterService.getById(id!),
        enabled: !!id,
    });
};

// ✅ CREATE
export const useCreatePrinter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePrinterPayload) =>
            PrinterService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            toastCreated("Printer");
        },

        onError: (error: any) => {
            toastError("Printer", error?.message || "Failed to create Printer");
        },
    });
};

// ✅ UPDATE
export const useUpdatePrinter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: UpdatePrinterPayload;
        }) => PrinterService.updateById(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            toastUpdated("Printer");
        },

        onError: (error: any) => {
            toastError("Printer", error?.message || "Failed to update Printer");
        },
    });
};

// ✅ DELETE
export const useDeletePrinter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            PrinterService.deleteById(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["printers"] });
            toastUpdated("Printer Deleted");
        },

        onError: (error: any) => {
            toastError("Printer", error?.message || "Failed to delete Printer");
        },
    });
};