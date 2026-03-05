// types/rate/rate.ts

export interface Rate {
    RATEID?: number;

    PURRATE: number;
    MRP: number;
    SELLINGRATE: number;

    ACTIVE: string;

    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;

    product?: {
        PRODUCTCODE: number;
        PRODUCTNAME?: string;
    };

    subProduct?: {
        SUBPRODUCTCODE: number;
        SUBPRODUCTNAME?: string;
    };
}


export interface RateForm {
    PRODUCTCODE: number | string;
    SUBPRODUCTCODE?: number | string;

    PURRATE: number | string;
    MRP: number | string;
    SELLINGRATE: number | string;

    ACTIVE: string;
}


export type AllRates = Rate[];