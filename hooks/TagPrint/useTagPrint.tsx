// hooks/TagPrint/useTagPrint.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTagPrint, filterTagPrint, duplicateTagPrint } from "@/service/TagPrintService";
import { TagPrintFilter } from "@/types/TagPrint/TagPrint";
import { toaster } from "@/components/ui/toaster";

// 🔹 Get all tag print records
export const useAllTagPrint = () => {
  return useQuery({
    queryKey: ["tag-print", "filter"],
    queryFn: getAllTagPrint,
  });
};

// 🔹 Filter tag print records
export const useFilterTagPrint = (filters: TagPrintFilter | null) => {
  return useQuery({
    queryKey: ["tag-print", "filter", filters],
    queryFn: () => filterTagPrint(filters || {}),
    enabled: !!filters && Object.keys(filters).length > 0,
  });
};

// 🔹 Duplicate Print (Generate new tags)
export const useDuplicateTagPrint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filters: TagPrintFilter) => duplicateTagPrint(filters),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tag-print"] });
      toaster.success({
        title: "Success",
        description: data.message || `${data.count} tag(s) generated successfully`,
        duration: 3000,
      });
    },
    
    onError: (error: any) => {
      toaster.error({
        title: "Duplicate Failed",
        description: error?.response?.data?.message || "Failed to generate duplicate tags",
        duration: 5000,
      });
    },
  });
};