import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DesignationService, Designation } from "@/service/DesignationService";
import { toastCreated, toastError, toastUpdated } from "@/component/toast/toast";

/* ===========================
   GET ALL
=========================== */
export const useAllDesignations = () => {
  return useQuery<Designation[]>({
    queryKey: ["designations"],
    queryFn: DesignationService.getAll,
  });
};

/* ===========================
   GET BY ID
=========================== */
export const useDesignationById = (code?: number) => {
  return useQuery<Designation>({
    queryKey: ["designation", code],
    queryFn: () => DesignationService.getById(code!),
    enabled: !!code,
  });
};

/* ===========================
   CREATE
=========================== */
export const useCreateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: Pick<Designation, "DESCRIPTION" | "ACTIVE">
    ) => DesignationService.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toastCreated("Designation");
    },

    onError: (error: any) => {
      toastError("Designation", error?.response?.data?.message || error.message);
    },
  });
};

/* ===========================
   UPDATE
=========================== */
export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Designation) =>
      DesignationService.update(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toastUpdated("Designation");
    },

    onError: (error: any) => {
      toastError("Designation", error?.response?.data?.message || error.message);
    },
  });
};

/* ===========================
   DELETE
=========================== */
export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: number) =>
      DesignationService.deleteById(code),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      toastUpdated("Designation Deleted");
    },

    onError: (error: any) => {
      toastError("Designation", error?.response?.data?.message || error.message);
    },
  });
};