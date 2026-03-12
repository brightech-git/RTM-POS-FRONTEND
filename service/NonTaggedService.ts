import { axiosInstance } from "@/api/axiosInstance";
import { NonTaged, NonTagedFilter, NonTagedResponse } from "@/types/NonTagged/NonTagged";

// 🔹 Get All NonTaged
export const getAllNonTaged = async (): Promise<NonTagedResponse> => {
  const { data } = await axiosInstance.get("/nontaged/filter");
  return data;
};



// 🔹 Sync invoices (POST /sync)
// 🔹 Sync invoices (POST /sync)
export const syncNonTaged = async (params: {
  from?: string;
  to?: string;
  billNos?: number[];  // Changed to array
  vendorCode?: number;
  productCode?: number;
}) => {
  const query = new URLSearchParams();

  if (params.from) query.append("fromDate", params.from);
  if (params.to) query.append("toDate", params.to);
  if (params.billNos && params.billNos.length > 0) {
    // If your API supports multiple bill numbers
    params.billNos.forEach(billNo => query.append("billNo", billNo.toString()));
  }
  if (params.vendorCode) query.append("vendorCode", params.vendorCode.toString());
  if (params.productCode) query.append("productCode", params.productCode.toString());

  const { data } = await axiosInstance.post(`/nontaged/sync?${query.toString()}`);
  return data;
};

// 🔹 Filter NonTaged
export const filterNonTaged = async (filters: NonTagedFilter) => {
  const query = new URLSearchParams();

  if (filters.from) query.append("fromDate", filters.from);
  if (filters.to) query.append("toDate", filters.to);
  if (filters.billNo) query.append("billNo", filters.billNo.toString());
  if (filters.vendorCode) query.append("vendorCode", filters.vendorCode.toString());
  if (filters.productCode) query.append("productCode", filters.productCode.toString());

  const { data } = await axiosInstance.get(`/nontaged/filter?${query.toString()}`);
  return data;
};