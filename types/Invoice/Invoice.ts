export interface InvoiceDetails {

    ROWSIGN?: string;
    

    VENDORCODE: number;
    ORIONBARCODE?: string;

    PRODUCTCODE: number;
    SUBPRODUCTCODE?: number;

    PIECES?: number;
    WEIGHT?: number;

    MRP: number;
    PURRATE: number;
    SELLINGRATE?: number;

    MARKUPPER?: number;
    MARKUP?: number;

    INVOICENO: string;
    BILLDATE: string;
    BILLNO?: number;

    TAGGEN?: string;
    BILLTYPE?: string;

    UNIQUEKEY?: string;
    UNITCODE?: number;

    AMOUNT?: number;
    TOTALAMOUNT?: number;

    TAXCALC?: string;
    TAXPER?: number;
    TAXAMOUNT?: number;

    DISCPER?: number;
    DISCOUNT?: number;

    ENTRYORDER?: number;

    HSNCODE?: string;
    HSNTAXCODE?: number;

    SGSTTAXCODE?: number;
    SGSTPER?: number;
    SGSTAMOUNT?: number;

    CGSTTAXCODE?: number;
    CGSTPER?: number;
    CGSTAMOUNT?: number;

    IGSTTAXCODE?: number;
    IGSTPER?: number;
    IGSTAMOUNT?: number;

    SRVTAXCODE?: number;
    SRVPER?: number;
    SRVAMOUNT?: number;

    HSNCALC?: string;

    BILLSTATUS?: string;

    IPID?: number;

    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;

    PRODUCTNAME?: string;
    SUBPRODUCTNAME?: string;
}


export interface InvoiceDetailsForm {

    VENDORCODE: string;
    PRODUCTCODE: string;
    SUBPRODUCTCODE?: string;

    ORIONBARCODE?: string;

    PIECES?: string;
    WEIGHT?: string;

    MRP: string;
    PURRATE: string;
    SELLINGRATE?: string;

    MARKUPPER?: string;

    INVOICENO: string;
    BILLDATE: string;

    TAGGEN?: string;

    DISCPER?: string;

    HSNCODE?: string;
    HSNTAXCODE?: string;
}

export type AllInvoiceDetails = InvoiceDetails[];