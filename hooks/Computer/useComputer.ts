// hooks/computer/useComputer.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ComputerService,
  COMPUTER,
  CreateComputerPayload,
} from "@/service/ComputerService";
import {
  toastCreated,
  toastUpdated,
  toastError,
} from "@/component/toast/toast";


// ================= GET ALL =================
export const useAllComputers = () => {
  return useQuery<COMPUTER[]>({
    queryKey: ["computers"],
    queryFn: ComputerService.getAll,
  });
};


// ================= GET BY ID =================
export const useComputerById = (ipId: number) => {
  return useQuery<COMPUTER>({
    queryKey: ["computer", ipId],
    queryFn: () => ComputerService.getById(ipId),
    enabled: !!ipId,
  });
};


// ================= GET BY IP =================
export const useComputerByIp = (ipAddress: string) => {
  return useQuery<COMPUTER>({
    queryKey: ["computer-ip", ipAddress],
    queryFn: () => ComputerService.getByIp(ipAddress),
    enabled: !!ipAddress,
  });
};


// ================= CREATE =================
export const useCreateComputer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateComputerPayload) =>
      ComputerService.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["computers"] });
      toastCreated("Computer");
    },

    onError: (error: any) => {
      toastError("Computer", error.message);
    },
  });
};


// ================= UPDATE =================
export const useUpdateComputer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateComputerPayload) =>
      ComputerService.update(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["computers"] });
      toastUpdated("Computer");
    },

    onError: (error: any) => {
      toastError("Computer", error.message);
    },
  });
};


// ================= DELETE =================
export const useDeleteComputer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ipId: number) =>
      ComputerService.deleteById(ipId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["computers"] });
      toastUpdated("Computer Deleted");
    },

    onError: (error: any) => {
      toastError("Computer", error.message);
    },
  });
};