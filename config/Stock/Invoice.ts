// config/Stock/Invoice.ts
import { FormField } from "@/types/form/form";

export const InvoiceDetailsConfig = (
    vendors: any[] = [],
    products: any[] = [],
    subProducts: any[] = []
): FormField[] => [
    {
        name: "INVOICENO",
        label: "Invoice No",
        type: "text",
        required: true,
        size: "xs",
        rounded: "full",
        width: "150px"
    },
    {
        name: "BILLDATE",
        label: "Bill Date",
        type: "date",
        required: true,
        size: "xs",
        rounded: "full",
        width: "150px",
        dateFormat: "yyyy-MM-dd"
    },
    {
        name: "VENDORCODE",
        label: "Vendor Code",
        required: true,
        type: "select",
        options: vendors.map(v => ({
            value: v.VENDORCODE,
            label: `${v.VENDORCODE} - ${v.VENDORNAME || 'Unknown'}`
        })),
        size: "xs",
        rounded: "full",
        width: "150px"
    },
    {
        name: "ORIONBARCODE",
        label: "Orion Barcode",
        type: "text",
        width: "150px",
        size: "xs",
        rounded: "full"
    },
    {
        name: "PRODUCTCODE",
        label: "Product Code",
        required: true,
        type: "select",
        options: products.map(p => ({
            value: p.PRODUCTCODE,
            label: `${p.PRODUCTCODE} - ${p.PRODUCTNAME || 'Unknown'}`
        })),
        size: "xs",
        rounded: "full",
        width: "150px"
    },
    {
        name: "SUBPRODUCTCODE",
        label: "Sub Product Code",
        type: "select",
        options: subProducts.map(s => ({
            value: s.SUBPRODUCTCODE,
            label: `${s.SUBPRODUCTCODE} - ${s.SUBPRODUCTNAME || 'Unknown'}`
        })),
        size: "xs",
        rounded: "full",
        width: "150px"
    },
    {
        name: "RATE",
        label: "Rate",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "100px",
        isReadOnly: true,
       
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
        name: "PIECES",
        label: "Pieces",
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
        name: "MRP",
        label: "MRP",
        required: true,
        type: "text",
        size: "xs",
        rounded: "full",
        width: "100px"
    },
    {
        name: "SELLINGRATE",
        label: "Selling Rate",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "120px",
        isReadOnly: true
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
        name: "DISCOUNTAMOUNT",
        label: "Discount Amount",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "120px",
        isReadOnly: true
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
        name: "MARKUPAMOUNT",
        label: "Markup Amount",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "120px",
        isReadOnly: true
    },
    {
        name: "AMOUNT",
        label: "Amount",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "120px",
        isReadOnly: true,
       
    },
    {
        name: "IGSTAMOUNT",
        label: "IGST",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "100px",
        isReadOnly: true
    },
    {
        name: "CGSTAMOUNT",
        label: "CGST",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "100px",
        isReadOnly: true
    },
    {
        name: "SGSTAMOUNT",
        label: "SGST",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "100px",
        isReadOnly: true
    },
    {
        name: "NETAMOUNT",
        label: "Net Amount",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "120px",
        isReadOnly: true
    },
    {
        name: "TAGGEN",
        label: "Tag Gen",
        type: "select",
        options: [
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" }
        ],
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
        name: "HSNTAXCODE",
        label: "HSN Tax Code",
        type: "text",
        size: "xs",
        rounded: "full",
        width: "150px"
    }
];