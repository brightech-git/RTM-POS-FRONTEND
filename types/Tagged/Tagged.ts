// Base interface matching API response
export interface ApiTagedItem {
  AMOUNT: number | null;
  BILLDATE: string;
  BILLNO: number;
  BILLSTATUS: string | null;
  BILLTYPE: string;
  CGSTAMOUNT: number | null;
  CGSTPER: number | null;
  CGSTTAXCODE: number | null;
  CREATEDBY: number;
  CREATEDDATE: string;
  CREATEDTIME: string;
  DISCOUNT: number | null;
  DISCPER: number | null;
  ENTRYORDER: number;
  HSNCALC: string | null;
  HSNCODE: string;
  HSNTAXCODE: number;
  IGSTAMOUNT: number | null;
  IGSTPER: number | null;
  IGSTTAXCODE: number | null;
  INVOICENO: string;
  IPID: number;
  MARKUP: number | null;
  MARKUPPER: number | null;
  MRP: number;
  ORIONBARCODE: string;
  PIECES: number;
  PRODUCTCODE: number;
  PRODUCTNAME: string | null;
  PURRATE: number;
  ROWSIGN: string;
  SELLINGRATE: number;
  SGSTAMOUNT: number | null;
  SGSTPER: number | null;
  SGSTTAXCODE: number | null;
  SRVAMOUNT: number | null;
  SRVPER: number | null;
  SRVTAXCODE: number | null;
  SUBPRODUCTCODE: number;
  SUBPRODUCTNAME: string | null;
  TAGGEN: string;
  TAXAMOUNT: number;
  TAXCALC: string;
  TAXPER: number;
  TOTALAMOUNT: number;
  UNIQUEKEY: string;
  UNITCODE: number;
  VENDORCODE: number;
  WEIGHT: number;
}

// Taged type (matching your export)
export interface Taged {
  rowSign: string;
  billNo?: number;
  vendorCode?: number;
  productCode?: number;
  subProductCode?: number;
  billDate?: string;
  qty?: number;
  rate?: number;
  amount?: number;
  barcode?: string;
  purRate?: number;
  pieces?: number;
  weight?: number;
  discount?: number;
  sellingRate?: number;
  markup?: number;
  mrp?: number;
  billStatus?: string;
  issRec?: string;
  TAGGEN?: string;
  BILLNO?:number;
  TAGNO?:string;
  PIECES?:number;
  SELLINGRATE?:number;
  
}

// Filter interfaces
export interface TagedFilter {
  fromDate?: string;
  toDate?: string;
  billNo?: number;
  vendorCode?: number;
  productCode?: number;
}

// UI Filter State (with string values and "ALL" option)
export interface TagedUIFilter {
  fromDate: string;
  toDate: string;
  billNo: string;
  vendorCode: string;
  productCode: string;
}

// Response types
export interface TagedApiResponse {
  message: string;
  data: ApiTagedItem[];
}

export type AllTaged = Taged[];