// service/SalesService.ts
import { axiosInstance } from "@/api/axiosInstance";
import { SalesDetails, TagedDetails, NonTagedDetails, SalesPayload } from "@/types/SalesBill/SalesBill";

export const fetchSaleDetails = async (identifier?: number | string) => {
  try {
    const { data } = await axiosInstance.get(`/sales/filter`, {
      params: { identifier }
    });

    return data;
  } catch (error) {
    console.error("Error fetching sale details:", error);
    throw error;
  }
};
export const saveSalesBatch = async (
  salesList: SalesPayload[],
  createdBy: number,
  paymentMode: string,
  cashGiven: number
) => {
  try {
    const { data } = await axiosInstance.post(
      '/api/v1/sales/saveBatch',
      { salesList, paymentMode, cashGiven },
      {
        headers: {
          'createdBy': createdBy.toString()
        }
      }
    );
    return data;
  } catch (error) {
    console.error("Error saving sales batch:", error);
    throw error;
  }
};