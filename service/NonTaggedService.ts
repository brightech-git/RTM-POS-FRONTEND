import { axiosInstance } from "@/api/axiosInstance";
import { NonTaged, NonTagedFilter } from "@/types/NonTagged/NonTagged";


// 🔹 Get All NonTaged
export const getAllNonTaged = async () => {
  try {
    const { data } = await axiosInstance.get("/nontaged");
    return data;
  } catch (err) {
    console.warn("Error fetching NonTaged", err);
    return err;
  }
};


// 🔹 Sync invoices (create)
export const syncNonTaged = async (from: string, to: string) => {
  try {
    const { data } = await axiosInstance.post(
      `/nontaged/sync?from=${from}&to=${to}`
    );
    return data;
  } catch (err) {
    console.warn("Error syncing NonTaged", err);
    return err;
  }
};


// 🔹 Get by ID
export const getNonTagedById = async (rowSign: string) => {
  try {
    const { data } = await axiosInstance.get(`/nontaged/${rowSign}`);
    return data;
  } catch (err) {
    console.warn("Error fetching NonTaged", err);
    return err;
  }
};


// 🔹 Update
export const updateNonTaged = async (rowSign: string, item: NonTaged) => {
  try {
    const { data } = await axiosInstance.put(`/nontaged/${rowSign}`, item);
    return data;
  } catch (err) {
    console.warn("Error updating NonTaged", err);
    return err;
  }
};


// 🔹 Delete
export const deleteNonTaged = async (rowSign: string) => {
  try {
    const { data } = await axiosInstance.delete(`/nontaged/${rowSign}`);
    return data;
  } catch (err) {
    console.warn("Error deleting NonTaged", err);
    return err;
  }
};


// 🔹 Filter
export const filterNonTaged = async (filters: NonTagedFilter) => {
  try {
    const params = new URLSearchParams();

    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.billNo) params.append("billNo", filters.billNo.toString());
    if (filters.vendorCode) params.append("vendorCode", filters.vendorCode.toString());
    if (filters.productCode) params.append("productCode", filters.productCode.toString());

    const { data } = await axiosInstance.get(`/nontaged/filter?${params.toString()}`);
    return data;
  } catch (err) {
    console.warn("Error filtering NonTaged", err);
    return err;
  }
};