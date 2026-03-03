export interface Product {
    PRODUCTCODE?: number;          // optional for create (auto-generated)
    PRODUCTNAME: string;
    SHORTNAME?: string;
    SUBPRODUCT: string;
    UNITCODE: number;
    ACTIVE: string;                // "Y" or "N"
    ALLOWDISCOUNT: string;         // "Y" or "N"
    PURUNITCODE: number;
    PRODUCTTYPE: string;
    TAGTYPE: string;
    ORIONBARCODE: string;
    EXPIRYDAYS: number;
}

export interface ProductForm {

    PRODUCTNAME: string;
    SHORTNAME?: string;
    SUBPRODUCT: string;
    UNITCODE: string;           // string for input
    ACTIVE: string;             // "Y" or "N"
    ALLOWDISCOUNT: string;      // "Y" or "N"
    PURUNITCODE: string;        // string for input
    PRODUCTTYPE: string;
    TAGTYPE: string;
    ORIONBARCODE: string;
    EXPIRYDAYS: string;         // string for input
}

// If your API returns an array directly:
export type AllProducts = Product[];
