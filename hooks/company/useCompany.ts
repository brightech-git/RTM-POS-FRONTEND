// hooks/company/useCompany.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyService, Company } from "@/service/CompanyService";
import { toastError, toastCreated, toastUpdated } from "@/component/toast/toast";

// Get All Companies
export const useAllCompanies = () => {
    return useQuery({
        queryKey: ["companies"],
        queryFn: CompanyService.getAll,
    });
};

// Get Company By Code
export const useCompanyById = (code: string) => {
    return useQuery({
        queryKey: ["company", code],
        queryFn: () => CompanyService.getByCode(code),
        enabled: !!code,
    });
};

// Create Company
export const useCreateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Partial<Company>) => CompanyService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toastCreated("Company");
        },
        onError: (error: any) => {
            toastError("Company", error.message);
        },
    });
};

// Update Company
export const useUpdateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Partial<Company>) => CompanyService.update(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toastUpdated("Company");
        },
        onError: (error: any) => {
            toastError("Company", error.message);
        },
    });
};

// Delete Company
export const useDeleteCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (code: string) => CompanyService.delete(code),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toastUpdated("Company Deleted");
        },
        onError: (error: any) => {
            toastError("Company", error.message);
        },
    });
};