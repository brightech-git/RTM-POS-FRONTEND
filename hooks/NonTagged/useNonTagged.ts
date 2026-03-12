import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllNonTaged,

  syncNonTaged,
 
  filterNonTaged,
} from "@/service/NonTaggedService";
import { NonTaged, NonTagedFilter, NonTagedResponse } from "@/types/NonTagged/NonTagged";

// 🔹 Get All NonTaged
export const useAllNonTaged = () => {
  return useQuery<NonTagedResponse>({
    queryKey: ["nontaged"],
    queryFn: getAllNonTaged,
    staleTime: 1000 * 60 * 5,
  });
};
// 🔹 Sync NonTaged
// 🔹 Sync NonTaged
export const useSyncNonTaged = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      from?: string;
      to?: string;
      billNos?: number[];  // Changed to array
      vendorCode?: number;
      productCode?: number;
    }) => syncNonTaged(params),

    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nontaged"] }),
  });
};


// 🔹 Filter NonTaged
export const useFilterNonTaged = (filters: NonTagedFilter) => {
  return useQuery({
    queryKey: ["nontaged", "filter", filters],
    queryFn: () => filterNonTaged(filters),
    enabled: !!filters,
  });
};