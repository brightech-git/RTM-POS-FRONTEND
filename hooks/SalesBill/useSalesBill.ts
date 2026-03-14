// hooks/Sales/useSales.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSaleDetails, saveSalesBatch } from "@/service/SalesBillService";
import { SalesPayload } from "@/types/SalesBill/SalesBill";

export const useFetchSaleDetails = (identifier?: number | string) => {
  return useQuery({
    queryKey: ["sale-details", identifier],
    queryFn: () => fetchSaleDetails(identifier),
    enabled: !!identifier,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveSalesBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      salesList,
      createdBy,
      paymentMode,
      cashGiven,
    }: {
      salesList: SalesPayload[];
      createdBy: number;
      paymentMode: string;
      cashGiven: number;
    }) => saveSalesBatch(salesList, createdBy, paymentMode, cashGiven),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-details"] });
    },
  });
};