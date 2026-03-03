// hooks/systemdetails/useSystemDetails.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SystemDetailsService,
  SYSTEMDETAILS,
  CreateSystemDetailsPayload,
} from "@/service/SystemDetailsService";
import {
  toastCreated,
  toastUpdated,
  toastError,
} from "@/component/toast/toast";


// ================= GET ALL =================
export const useAllSystemDetails = () => {
  return useQuery<SYSTEMDETAILS[]>({
    queryKey: ["systemdetails"],
    queryFn: SystemDetailsService.getAll,
  });
};


// ================= GET BY ID =================
export const useSystemDetailsById = (ipId: number) => {
  return useQuery<SYSTEMDETAILS>({
    queryKey: ["systemdetails", ipId],
    queryFn: () => SystemDetailsService.getById(ipId),
    enabled: !!ipId,
  });
};


// ================= CREATE =================
export const useCreateSystemDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSystemDetailsPayload) =>
      SystemDetailsService.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemdetails"] });
      toastCreated("System Details");
    },

    onError: (error: any) => {
      toastError("System Details", error.message);
    },
  });
};


// ================= UPDATE =================
export const useUpdateSystemDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSystemDetailsPayload) =>
      SystemDetailsService.update(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemdetails"] });
      toastUpdated("System Details");
    },

    onError: (error: any) => {
      toastError("System Details", error.message);
    },
  });
};


// ================= DELETE =================
export const useDeleteSystemDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ipId: number) =>
      SystemDetailsService.deleteById(ipId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemdetails"] });
      toastUpdated("System Details Deleted");
    },

    onError: (error: any) => {
      toastError("System Details", error.message);
    },
  });
};