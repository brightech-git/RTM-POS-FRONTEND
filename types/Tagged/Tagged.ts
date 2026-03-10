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
}

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

export type AllTaged = Taged[];