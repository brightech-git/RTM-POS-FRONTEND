// service/TagPrintService.ts
import { axiosInstance } from "@/api/axiosInstance";
import { TagPrintItem, TagPrintFilter, DuplicatePrintResponse } from "@/types/TagPrint/TagPrint";

// 🔹 Get all tag print records
export const getAllTagPrint = async (): Promise<{ message: string; data: TagPrintItem[] }> => {
  const { data } = await axiosInstance.get("/tag-print/filter");
  return data;
};

// 🔹 Filter tag print records
export const filterTagPrint = async (filters: TagPrintFilter): Promise<{ message: string; data: TagPrintItem[] }> => {
  const params = new URLSearchParams();
  
  if (filters.fromDate) params.append("fromDate", filters.fromDate);
  if (filters.toDate) params.append("toDate", filters.toDate);
  if (filters.billNo) params.append("billNo", filters.billNo);
  if (filters.fromTagNo) params.append("fromTagNo", filters.fromTagNo);
  if (filters.toTagNo) params.append("toTagNo", filters.toTagNo);

  const { data } = await axiosInstance.get(`/tag-print/filter?${params.toString()}`);
  return data;
};

// 🔹 Duplicate Print (Copy records and generate new tag numbers)
export const duplicateTagPrint = async (filters: TagPrintFilter): Promise<DuplicatePrintResponse> => {
  const params = new URLSearchParams();
  
  // Only pass filters that have values
  if (filters.fromDate) params.append("fromDate", filters.fromDate);
  if (filters.toDate) params.append("toDate", filters.toDate);
  if (filters.billNo) params.append("billNo", filters.billNo);
  if (filters.fromTagNo) params.append("fromTagNo", filters.fromTagNo);
  if (filters.toTagNo) params.append("toTagNo", filters.toTagNo);

  const { data } = await axiosInstance.post(`/tag-print/duplicatePrint?${params.toString()}`);
  return data;
};