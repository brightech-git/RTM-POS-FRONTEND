// types/TagPrint.ts
export interface TagPrintItem {
  BILLNO: number;
  CREATEDBY: number;
  CREATEDDATE: string;
  CREATEDTIME: string;
  DISCPER: number;
  ENTRYORDER: number;
  HSNCODE: string;
  IPID: number;
  MARKUP: number;
  MARKUPPER: number;
  MRP: number;
  PIECES: number;
  PLUSDATE: string;
  PRODUCTCODE: number;
  PRODUCTNAME: string | null;
  PURRATE: number;
  ROWSIGN: string;
  SELLINGRATE: number;
  SUBPRODUCTCODE: number;
  SUBPRODUCTNAME: string | null;
  TAGNO: string;
  UNIQUEKEY: string;
  UNITCODE: number;
  VENDORCODE: number;
  VENDORNAME: string | null;
  WEIGHT: number;
}

export interface TagPrintFilter {
  fromDate?: string;
  toDate?: string;
  billNo?: string;
  vendorCode?: string;
  productCode?: string;
  fromTagNo?: string;
  toTagNo?: string;
}

export interface DuplicatePrintResponse {
  message: string;
  count: number;
  data?: Array<{
    BILLNO: number;
    TAGNO: string;
    [key: string]: any;
  }>;
}