import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OperatorService, OperatorDTO, LoginRequest, UpdatePasswordRequest, Operator, ApiResponse } from "@/service/OperatorService";
import { toastCreated, toastError, toastUpdated, toastLoaded } from "@/component/toast/toast";

// ================= GET ALL OPERATORS =================
export const useAllOperators = () => {
  return useQuery<ApiResponse<Operator[]>>({
    queryKey: ["operators"],
    queryFn: OperatorService.getAll,
  });
};

// ================= REGISTER =================
export const useRegisterOperator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OperatorDTO) => OperatorService.register(payload),
    onSuccess: () => {
      toastCreated("Operator");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      toastError("Operator", error.message);
    },
  });
};

// ================= LOGIN =================
export const useLoginOperator = () => {
  return useMutation({
    mutationFn: (payload: LoginRequest) => OperatorService.login(payload),
    onSuccess: () => {
      toastLoaded("Login Successful");
    },
    onError: (error: any) => {
      toastError("Login", error.message);
    },
  });
};

// ================= UPDATE PASSWORD =================
export const useUpdateOperatorPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePasswordRequest) => OperatorService.updatePassword(payload),
    onSuccess: () => {
      toastUpdated("Password");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      toastError("Password", error.message);
    },
  });
};

// ================= DELETE OPERATOR =================
export const useDeleteOperator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (operCode: number) => OperatorService.deleteOperator(operCode),
    onSuccess: () => {
      toastUpdated("Operator Deleted");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      toastError("Operator", error.message);
    },
  });
};