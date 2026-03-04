import { axiosInstance } from "@/api/axiosInstance";
import { Product } from "@/types/product/Product";

export const getAllProducts = async() =>{
    try{
        const {data} = await axiosInstance.get('/product/all');
        return data;

    }
    catch(err){
        console.warn("error fetching products", err);
        return err ; 
    }

}

export const getAllActiveProducts = async () => {
    try {
        const { data } = await axiosInstance.get('/product/active');
        return data;

    }
    catch (err) {
        console.warn("error fetching products", err);
        return err;
    }


}
export const getProductById = async (id:number) => {
    try {
        const { data } = await axiosInstance.get(`/product/${id}`);
        return data;

    }
    catch (err) {
        console.warn("error fetching products", err);
        return err;
    }


}

export const createProduct = async (product:Product) => {
    try {
        console.log('product in service', product);
        const { data } = await axiosInstance.post('/product/create' ,product);
        return data;

    }
    catch (err) {
        console.warn("error fetching products", err);
        return err;
    }


}
export const updateProduct = async (product:any) => {
    try {
        console.log('product in service', product);
        const { data } = await axiosInstance.put('/product/update', product);
        return data;

    }
    catch (err) {
        console.warn("error fetching products", err);
        return err;
    }


}


export const deleteProduct = async () => {
    try {

    }
    catch (err) {

    }

}



