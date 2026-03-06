export interface Barcode {
    ORIONID?: number;          // optional for create
    VENDORCODE: number;
    PRODUCTCODE: number;
    SUBPRODUCTCODE?: number;
    ORIONBARCODE: string;
    MRP: number;
    PURRATE: number;
    SELLINGRATE: number;
    ACTIVE: string;            // "Y" | "N"
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

export interface BarcodeForm {
    VENDORCODE: string;
    PRODUCTCODE: string;
    SUBPRODUCTCODE?: string;
    ORIONBARCODE: string;
    MRP: string;
    PURRATE: string;
    SELLINGRATE: string;
    ACTIVE: string;
}

export type AllBarcodes = Barcode[];