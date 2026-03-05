// types/subproduct/subproduct.ts
export interface SubProduct {
    SUBPRODUCTCODE?: number;
    SUBPRODUCTNAME: string;
    SHORTNAME?: string;
    ACTIVE: string;
    PRODUCTCODE: number; // Add this to link to parent product
    product?: {
        PRODUCTCODE: number;
        PRODUCTNAME: string;
        SHORTNAME: string;
    };
}

export interface SubProductForm {
    SUBPRODUCTNAME: string;
    SHORTNAME?: string;
    ACTIVE: string;
    PRODUCTCODE: number | string;
}

export type AllSubProducts = SubProduct[];