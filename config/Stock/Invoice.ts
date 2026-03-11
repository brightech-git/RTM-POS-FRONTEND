import { FormField } from "@/types/form/form";

interface InvoiceConfigParams {
  vendors?: any[];
  products?: any[];
  subProducts?: any[];
  todayDate?: Date;
   isProductDisabled?: boolean;
  isSubProductDisabled?: boolean;
}

export const InvoiceDetailsConfig = ({
  vendors = [],
  products = [],
  subProducts = [],
  todayDate,
  isProductDisabled,
  isSubProductDisabled,
}: InvoiceConfigParams): FormField[] => {
  return [
    {
      name: "INVOICENO",
      label: "INVOICE NO",
      type: "number",
      required: true,
      size: "xs",
      rounded: "sm",
      width: "150px",
    },
    {
      name: "BILLDATE",
      label: "BILL DATE",
      type: "date",
      required: true,
      size: "xs",
      rounded: "sm",
      width: "200px",
      maxDate: todayDate,
      colSpan: 2,
    },

    {
      name: "VENDORCODE",
      label: "VENDOR NAME",
      required: true,
      type: "combobox",
      options: vendors.map((p) => ({
        value: p.value,
        label: p.label,
      })),
      size: "xs",
      rounded: "sm",
      width: "300px",
      colSpan: 2,
    },
    {
      name: "ORIONBARCODE",
      label: "ORION BARCODE",
      required: true,
      type: "number",
      size: "xs",
      rounded: "sm",
     width: "300px",
      colSpan: 2,
    },
    {
      name: "PRODUCTCODE",
      label: "PRODUCT NAME",
      required: true,
      type: "combobox",
      options: products.map((p) => ({
        value: p.value,
        label: p.label,
      })),
      size: "xs",
      rounded: "sm",
     width: "300px",
      colSpan: 2,
    },
   {
      name: "SUBPRODUCTCODE",
      label: "SUP PRODUCT NAME",
      type: "combobox",
      options: subProducts.map((p) => ({
        value: p.value,
        label: p.label,
      })),
      size: "xs",
      rounded: "sm",
      width: "300px",
      dependsOn: "PRODUCTCODE",
      colSpan: 2,
      required: false, // Explicitly set as not required
      disabled: isSubProductDisabled, // Use the prop
    },
    {
      name: "RATE",
      label: "PURCHASE RATE",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      isReadOnly: true,
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
    {
      name: "WEIGHT",
      label: "WEIGHT",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
    {
      name: "PIECES",
      label: "PICES",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      dependsOn: "PRODUCTCODE",
    },
    {
      name: "MRP",
      label: "MRP RATE",
      required: true,
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
     {
      name: "AMOUNT",
      label: "AMOUNT",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "120px",
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
    {
      name: "SELLINGRATE",
      label: "SELLING RATE",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "120px",
      isReadOnly: true,
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
    // {
    //     name: "DISCPER",
    //     label: "DISCOUNT %",
    //     type: "number",
    //     size: "xs",
    //     rounded: "sm",
    //     width: "100px",
    //     dependsOn: "AMOUNT"
    // },
    // {
    //     name: "DISCOUNTAMOUNT",
    //     label: "DISCOUNT AMOUNT",
    //     type: "number",
    //     size: "xs",
    //     rounded: "sm",
    //     width: "120px",
    //     disabled: true,
    //     dependsOn: "PRODUCTCODE"
    // },
    // {
    //     name: "MARKUPPER",
    //     label: "MARKUP %",
    //     type: "number",
    //     size: "xs",
    //     rounded: "sm",
    //     width: "100px",
    //     dependsOn: "PRODUCTCODE"
    // },
    // {
    //     name: "MARKUPAMOUNT",
    //     label: "MARKUP AMOUNT",
    //     type: "number",
    //     size: "xs",
    //     rounded: "sm",
    //     width: "120px",
    //     disabled: true,
    //     dependsOn: "PRODUCTCODE"
    // },
   
    {
      name: "SGSTAMOUNT",
      label: "SGST",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
    {
      name: "IGSTAMOUNT",
      label: "IGST",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
    
    {
      name: "CGSTAMOUNT",
      label: "CGST",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "100px",
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },
    {
      name: "NETAMOUNT",
      label: "NET AMOUNT",
      type: "number",
      size: "xs",
      rounded: "sm",
      width: "120px",
      disabled: true,
      dependsOn: "PRODUCTCODE",
    },

    // {
    //     name: "HSNCODE",
    //     label: "HSN Code",
    //     type: "number",
    //     size: "xs",
    //     rounded: "sm",
    //     width: "150px",
    //     dependsOn: "PRODUCTCODE",
    //     disabled:true
    // },
    // {
    //     name: "HSNTAXCODE",
    //     label: "HSN TAX CODE",
    //     type: "number",
    //     size: "xs",
    //     rounded: "sm",
    //     width: "150px",
    //     dependsOn: "PRODUCTCODE",
    //     disabled:true
    // }
  ];
};