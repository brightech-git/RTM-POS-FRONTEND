import { axiosInstance } from "@/api/axiosInstance";
import { Taged, TagedFilter } from "@/types/Tagged/Tagged";

// 🔹 Get ALL
export const getAllTaged = async (): Promise<Taged[]> => {
  const { data } = await axiosInstance.get("/taged/filter");
  console.log("All Tagged Data",data)
  return data.data || [];
};

// 🔹 Sync
export const syncTaged = async (filters: TagedFilter): Promise<Taged[]> => {
  const params = new URLSearchParams();

  if (filters.fromDate) params.append("fromDate", filters.fromDate);
  if (filters.toDate) params.append("toDate", filters.toDate);
  if (filters.billNo) params.append("billNo", filters.billNo.toString());
  if (filters.vendorCode) params.append("vendorCode", filters.vendorCode.toString());
  if (filters.productCode) params.append("productCode", filters.productCode.toString());

  const { data } = await axiosInstance.post(`/taged/sync?${params.toString()}`);
   console.log("All Sync Data",data)

  return data.data || [];
};

// 🔹 Filter
export const filterTaged = async (filters: TagedFilter): Promise<Taged[]> => {
  const params = new URLSearchParams();

  if (filters.fromDate) params.append("fromDate", filters.fromDate);
  if (filters.toDate) params.append("toDate", filters.toDate);
  if (filters.billNo) params.append("billNo", filters.billNo.toString());
  if (filters.vendorCode) params.append("vendorCode", filters.vendorCode.toString());
  if (filters.productCode) params.append("productCode", filters.productCode.toString());

  const { data } = await axiosInstance.get(`/taged/filter?${params.toString()}`);

  return data.data || [];
};