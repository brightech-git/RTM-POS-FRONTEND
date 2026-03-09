// hook
import { useQuery } from "@tanstack/react-query";
import { getCascadeProducts } from "@/service/CasCadeProductFilterService";

export const useCascadeProductFilter = (filter?: any) => {
  return useQuery({
    queryKey: ["cascadeProducts", filter],
    queryFn: () => getCascadeProducts(filter),
    staleTime: 1000 * 60 * 5,
 
  });
};