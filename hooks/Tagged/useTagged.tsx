import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTaged, syncTaged, filterTaged } from "@/service/TaggedService";
import { TagedFilter } from "@/types/Tagged/Tagged";

// 🔹 Get ALL
export const useAllTaged = () => {
  return useQuery({
    queryKey: ["taged"],
    queryFn: getAllTaged,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// 🔹 Filter
export const useFilterTaged = (filters: TagedFilter | null) => {
  return useQuery({
    queryKey: ["taged", "filter", filters],
    queryFn: () => filterTaged(filters || {}),
    enabled: !!filters && Object.keys(filters).length > 0,
  });
};

// 🔹 Sync
export const useSyncTaged = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filters: TagedFilter) => syncTaged(filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taged"] });
    },
  });
};