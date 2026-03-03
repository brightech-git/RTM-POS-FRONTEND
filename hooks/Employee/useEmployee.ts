// hooks/employee/useEmployee.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeeService, Employee, CreateEmployeePayload } from "@/service/EmployeeService";
import { toastError, toastCreated, toastUpdated } from "@/component/toast/toast";

// GET ALL EMPLOYEES
export const useAllEmployees = () => {
    return useQuery<Employee[]>({
        queryKey: ["employees"],
        queryFn: EmployeeService.getAll,
    });
};

// CREATE EMPLOYEE
export const useCreateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateEmployeePayload) =>
            EmployeeService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toastCreated("Employee");
        },

        onError: (error: any) => {
            toastError("Employee", error.message);
        },
    });
};

// UPDATE EMPLOYEE
export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateEmployeePayload) =>
            EmployeeService.update(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toastUpdated("Employee");
        },

        onError: (error: any) => {
            toastError("Employee", error.message);
        },
    });
};

// DELETE EMPLOYEE
export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (empId: string) =>
            EmployeeService.deleteById(empId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toastUpdated("Employee Deleted");
        },

        onError: (error: any) => {
            toastError("Employee", error.message);
        },
    });
};