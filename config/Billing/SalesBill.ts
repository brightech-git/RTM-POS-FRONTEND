// config/Billing/SalesBill.ts
import { FormField } from "@/types/form/form";
import { RefObject } from "react";

interface SalesConfigParams {
  todayDate?: Date;
  isTagedDisabled?: boolean;
  productDetails?: any;
  tagNoRef?: RefObject<HTMLInputElement>; // ADD THIS
}

export const SalesConfig = ({
  todayDate,
  isTagedDisabled,
  productDetails,
  tagNoRef, // ← ADD THIS
}: SalesConfigParams): FormField[] => {
  return [
    {
      name: "TAGNO",
      label: "TagNo / Orion",
      type: "text",
      required: true,
      size: "xs",
      rounded: "sm",
      width: "100%",
      colSpan: 2,
      placeholder: "Scan or enter barcode...",
      inputRef: tagNoRef, // Now TypeScript knows it
    },
    // Row 2: Product Name
    {
      name: "PRODUCTNAME",
      label: "Product",
      type: "text",
      size: "xs",
      rounded: "sm",
      width: "100%",
      disabled: true,
      isReadOnly: true,
      colSpan: 2,
      dependsOn: "TAGNO",
    },
    {
      name: "SUBPRODUCTNAME",
      label: "SubProduct",
      type: "text",
      size: "xs",
      rounded: "sm",
      width: "100%",
      disabled: true,
      isReadOnly: true,
      colSpan: 2,
      dependsOn: "TAGNO",
    },
    // Row 3: Rate, Qty, UOM
    {
      name: "RATE",
      label: "Rate",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      isReadOnly: true,
      colSpan: 1,
    },
    {
      name: "QTY",
      label: "Qty",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "80px",
      required: true,
      colSpan: 1,
       dependsOn: "TAGNO",
    },
    {
      name: "UOM",
      label: "UOM",
      type: "text",
      size: "xs",
      rounded: "sm",
      width: "80px",
      disabled: true,
      colSpan: 1,
    },
    {
      name: "WEIGHT",
      label: "Weight",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "80px",
      disabled: true,
      colSpan: 1,
    },
    // Row 4: Discount % and Discount Amount
    {
      name: "DISCPER",
      label: "Discount %",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      colSpan: 1,
       dependsOn: "QTY",
    },
    {
      name: "DISCOUNTAMOUNT",
      label: "Discount Amt",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "120px",
      disabled: true,
      colSpan: 1,
    },
    // Row 5: Amount, GST, Total
    {
      name: "AMOUNT",
      label: "Amount",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "120px",
      disabled: true,
      colSpan: 1,
    },
    // Row 6: IGST, CGST, SGST
    {
      name: "IGSTAMOUNT",
      label: "IGST",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      colSpan: 1,
    },
    {
      name: "CGSTAMOUNT",
      label: "CGST",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      colSpan: 1,
    },
    {
      name: "SGSTAMOUNT",
      label: "SGST",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      colSpan: 1,
    },
    {
      name: "SALEMANCODE",
      label: "SalesMan",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      colSpan: 1,
       dependsOn: "QTY",
    },
    {
      name: "TOTAL",
      label: "Total",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "120px",
      disabled: true,
      colSpan: 1,
    },
  ];
};