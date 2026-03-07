import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAllNonTaged,
  getNonTagedById,
  syncNonTaged,
  updateNonTaged,
  deleteNonTaged,
  filterNonTaged
} from "@/service/NonTaggedService";


// 🔹 Get All
export const useAllNonTaged = () => {
  return useQuery({
    queryKey: ["nontaged"],
    queryFn: getAllNonTaged,
    staleTime: 1000 * 60 * 5,
  });
};


// 🔹 Get By Id
export const useNonTagedById = (rowSign: string) => {
  return useQuery({
    queryKey: ["nontaged", rowSign],
    queryFn: () => getNonTagedById(rowSign),
    enabled: !!rowSign,
  });
};


// 🔹 Sync
export const useSyncNonTaged = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      syncNonTaged(from, to),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nontaged"] });
    },
  });
};


// 🔹 Update
export const useUpdateNonTaged = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rowSign, item }: { rowSign: string; item: any }) =>
      updateNonTaged(rowSign, item),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nontaged"] });
    },
  });
};


// 🔹 Delete
export const useDeleteNonTaged = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNonTaged,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nontaged"] });
    },
  });
};


// 🔹 Filter
export const useFilterNonTaged = (filters: any) => {
  return useQuery({
    queryKey: ["nontaged", "filter", filters],
    queryFn: () => filterNonTaged(filters),
    enabled: !!filters,
  });
};