import { FormField } from "@/types/form/form";

export const InvoiceDetailsConfig = (
    vendors: any[] = [],
    products: any[] = [],
    subProducts: any[] = []
): FormField[] => [

{
    name: "ROWSIGN",
    label: "Row Sign",
    type: "text",
    required: true,
    autoFocus: true,
    width: "120px",
    maxWidth: "120px",
    size: "xs",
    rounded: "full"
},

{
    name: "VENDORCODE",
    label: "Vendor",
    required: true,
    type: "select",
    options: vendors.map(v => ({
        value: v.VENDORCODE,
        label: v.VENDORNAME
    })),
    size: "xs",
    rounded: "full",
    width: "150px"
},

{
    name: "ORIONBARCODE",
    label: "Orion Barcode",
    type: "text",
    required: true,
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "PRODUCTCODE",
    label: "Product",
    required: true,
    type: "select",
    options: products.map(p => ({
        value: p.PRODUCTCODE,
        label: p.PRODUCTNAME
    })),
    size: "xs",
    rounded: "full",
    width: "150px"
},

{
    name: "SUBPRODUCTCODE",
    label: "Sub Product",
    type: "select",
    options: subProducts.map(s => ({
        value: s.SUBPRODUCTCODE,
        label: s.SUBPRODUCTNAME
    })),
    size: "xs",
    rounded: "full",
    width: "150px"
},

{
    name: "PIECES",
    label: "Pieces",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "100px"
},

{
    name: "WEIGHT",
    label: "Weight",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "100px"
},

{
    name: "MRP",
    label: "MRP",
    required: true,
    type: "text",
    size: "xs",
    rounded: "full",
    width: "100px"
},

{
    name: "PURRATE",
    label: "Purchase Rate",
    required: true,
    type: "text",
    size: "xs",
    rounded: "full",
    width: "120px"
},

{
    name: "SELLINGRATE",
    label: "Selling Rate",
    required: true,
    type: "text",
    size: "xs",
    rounded: "full",
    width: "120px"
},

{
    name: "MARKUPPER",
    label: "Markup %",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "100px"
},

{
    name: "INVOICENO",
    label: "Invoice No",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "150px"
},

{
    name: "BILLDATE",
    label: "Bill Date",
    type: "date",
    size: "xs",
    rounded: "full",
    width: "150px"
},

{
    name: "BILLNO",
    label: "Bill No",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "120px"
},

{
    name: "UNITCODE",
    label: "Unit Code",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "120px"
},

{
    name: "TAXPER",
    label: "Tax %",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "100px"
},

{
    name: "DISCPER",
    label: "Discount %",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "100px"
},

{
    name: "HSNCODE",
    label: "HSN Code",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "150px"
},

{
    name: "BILLSTATUS",
    label: "Bill Status",
    type: "text",
    size: "xs",
    rounded: "full",
    width: "150px"
}

];