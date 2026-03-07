// service
import { axiosInstance } from "@/api/axiosInstance";

export const getCascadeProducts = async (filter: any) => {
    try {
        console.log(filter, "productfilter");
        const { data } = await axiosInstance.get("filter/cascade", {
            params: filter, // pass filter as query params
        });
        console.log(data ,'productfilter');
        return data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};