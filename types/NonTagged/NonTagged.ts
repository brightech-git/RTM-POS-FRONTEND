export interface NonTaged {
  AMOUNT: number | null;
  BILLDATE: string;
  BILLNO: number;
  BILLSTATUS: string | null;
  CREATEDBY?: number;
  CREATEDDATE?: string;
  CREATEDTIME?: string;
  DISCOUNT: number | null;
  DISCPER?: number | null;
  ENTRYORDER?: number;
  IPID?: number;
  ISSREC: string;
  MARKUP: number | null;
  MARKUPPER?: number | null;
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
  TOTALAMOUNT?: number;
  UNIQUEKEY?: string;
  UNITCODE?: number;
  VENDORCODE: number;
  VENDORNAME: string | null;
  WEIGHT: number;
}

export interface NonTagedFilter {
  from?: string;
  to?: string;
  billNo?: number;
  vendorCode?: number;
  productCode?: number;
}

export interface NonTagedResponse {
  message: string;
  data: NonTaged[];
}

export type AllNonTaged = NonTaged[];