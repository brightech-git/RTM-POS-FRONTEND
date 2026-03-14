// types/Sales/Sales.ts
export interface SalesDetails {
  ROWSIGN: string;
  BILLNO: number;
  BILLDATE: string;
  BILLTYPE: string;
  TAGNO: string;
  ORIONBARCODE: string;
  UNIQUEKEY: string;
  PRODUCTCODE: number;
  SUBPRODUCTCODE: number;
  UNITCODE: number;
  PIECES: number;
  WEIGHT: number;
  RATE: number;
  MRP: number;
  AMOUNT: number;
  TOTALAMOUNT: number;
  TAXCALC: string;
  TAXPER: number;
  TAXAMOUNT: number;
  DISCCALCTYPE: string;
  DISCPER: number;
  DISCOUNT: number;
  SALEMANCODE: string;
  ENTRYORDER: number;
  HSNCODE: string;
  HSNTAXCODE: number | null;
  SGSTTAXCODE: number | null;
  SGSTPER: number;
  SGSTAMOUNT: number;
  CGSTTAXCODE: number | null;
  CGSTPER: number;
  CGSTAMOUNT: number;
  IGSTTAXCODE: number | null;
  IGSTPER: number;
  IGSTAMOUNT: number;
  SRVTAXCODE: number | null;
  SRVPER: number;
  SRVAMOUNT: number;
  DELVSTATECODE: string;
  HSNCALC: string;
  BILLSTATUS: string;
  IPID: number;
  CREATEDBY: number;
  CREATEDDATE: string;
  CREATEDTIME: string;
}

export interface TagedDetails {
  sno: string;
  tagNo: string;
  productSubProduct: string;
  qty: number;
  uom: string;
  rate: number;
  discount: number;
  amount: number;
  gst: number;
  total: number;
}

export interface NonTagedDetails {
  AMOUNT: number;
  BILLDATE: string;
  BILLNO: number;
  BILLSTATUS: string;
  CREATEDBY: number;
  CREATEDDATE: string;
  CREATEDTIME: string;
  DISCOUNT: number;
  DISCPER: number;
  ENTRYORDER: number;
  IPID: number;
  ISSREC: string;
  MARKUP: number;
  MARKUPPER: number;
  MRP: number;
  ORIONBARCODE: string;
  PIECES: number;
  PRODUCTCODE: number;
  PRODUCTNAME: string | null;
  PURRATE: number;
  ROWSIGN: string;
  SELLINGRATE: number;
  SUBPRODUCTCODE: number;
  SUBPRODUCTNAME: string | null;
  TOTALAMOUNT: number;
  UNIQUEKEY: string;
  UNITCODE: number;
  VENDORCODE: number;
  VENDORNAME: string | null;
  WEIGHT: number;
}

export interface SalesBatchRequest {
  salesList: SalesPayload[];
  paymentMode: string;
  cashGiven: number;
}

export interface SalesPayload {
  TAGNO: string;
  ORIONBARCODE: string;
  PRODUCTCODE: number;
  SUBPRODUCTCODE: number;
  PIECES: number;
  WEIGHT?: number;
  RATE: number;
  MRP?: number;
  AMOUNT: number;
  TOTALAMOUNT: number;
  TAXPER?: number;
  TAXAMOUNT?: number;
  DISCPER?: number;
  DISCOUNT?: number;
  SGSTPER?: number;
  SGSTAMOUNT?: number;
  CGSTPER?: number;
  CGSTAMOUNT?: number;
  IGSTPER?: number;
  IGSTAMOUNT?: number;
  HSNCODE?: string;
  HSNTAXCODE?: number;
  BILLTYPE: string;
  UNIQUEKEY?: string;
  SALEMANCODE: string;
  ENTRYORDER: number;
  IPID: number;
}

export interface CashCollectionResponse {
  billNo: string;
  billAmount: number;
  cashGiven: number;
  balance: number;
}