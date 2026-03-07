export interface NonTaged {
  rowSign: string;
  billNo?: number;
  vendorCode?: number;
  productCode?: number;
  billDate?: string;
  qty?: number;
  rate?: number;
  amount?: number;
}

export interface NonTagedFilter {
  from?: string;
  to?: string;
  billNo?: number;
  vendorCode?: number;
  productCode?: number;
}

export type AllNonTaged = NonTaged[];