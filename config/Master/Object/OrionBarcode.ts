import { FormField } from "@/types/form/form";
import { YesOrNo } from "@/data/YesOrNo/YesOrNoTypes";

export const BarcodeConfig = (
    vendors: any[] = [],
    products: any[] = [],
    subProducts: any[] = []
): FormField[] => [

{
    name: "VENDORCODE",
    label: "Vendor",
    type: "select",
    required: true,
    size: "xs",
    rounded: "full",
    width: "180px",
    options: vendors.map(v => ({
        value: v.VENDORCODE,
        label: v.VENDORNAME
    }))
},

{
    name: "PRODUCTCODE",
    label: "Product",
    type: "select",
    required: true,
    size: "xs",
    rounded: "full",
    width: "180px",
    options: products.map(p => ({
        value: p.PRODUCTCODE,
        label: `${p.PRODUCTNAME} (${p.SHORTNAME})`
    }))
},

{
    name: "SUBPRODUCTCODE",
    label: "Sub Product",
    type: "select",
    size: "xs",
    rounded: "full",
    width: "180px",
    options: subProducts.map(sp => ({
        value: sp.SUBPRODUCTCODE,
        label: sp.SUBPRODUCTNAME
    }))
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
    name: "MRP",
    label: "MRP",
    type: "number",
    required: true,
    size: "xs",
    rounded: "full",
    width: "120px"
},

{
    name: "PURRATE",
    label: "Purchase Rate",
    type: "number",
    required: true,
    size: "xs",
    rounded: "full",
    width: "120px"
},

{
    name: "SELLINGRATE",
    label: "Selling Rate",
    type: "number",
    required: true,
    size: "xs",
    rounded: "full",
    width: "120px"
},

{
    name: "ACTIVE",
    label: "Active",
    type: "select",
    options: YesOrNo,
    defaultValue: "Y",
    size: "xs",
    rounded: "full",
    width: "100px"
}

];