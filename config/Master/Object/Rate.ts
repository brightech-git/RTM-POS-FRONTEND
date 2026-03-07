// config/Master/Object/Rates.ts

import { FormField } from "@/types/form/form";
import { YesOrNo } from "@/data/YesOrNo/YesOrNoTypes";

export const RateConfig = (
    products: any[] = [],
    subProducts: any[] = []
): FormField[] => [

    {
        name: "PRODUCTCODE",
        label: "Product Name",
        required: true,
        width: "180px",
        maxWidth: "180px",
        rounded: "full",
        type: "select",
        size: "xs",
        options: products.map(p => ({
            value: p.PRODUCTCODE,
            label: `${p.PRODUCTNAME} (${p.SHORTNAME})`
        })),
        placeholder: "Select product"
    },

    {
        name: "SUBPRODUCTCODE",
        label: "Sub Product",
        required: false,
        width: "180px",
        maxWidth: "180px",
        rounded: "full",
        type: "select",
        size: "xs",
        options: subProducts.map(s => ({
            value: s.SUBPRODUCTCODE,
            label: `${s.SUBPRODUCTNAME} (${s.SHORTNAME})`
        })),
        placeholder: "Select sub product"
    },

    {
        name: "PURRATE",
        label: "Purchase Rate",
        type: "number",
        required: true,
        width: "150px",
        maxWidth: "150px",
        size: "xs",
        rounded: "full",
        placeholder: "Enter purchase rate"
    },

    {
        name: "MRP",
        label: "MRP",
        type: "number",
        required: true,
        width: "120px",
        maxWidth: "120px",
        size: "xs",
        rounded: "full",
        placeholder: "Enter MRP"
    },

    {
        name: "SELLINGRATE",
        label: "Selling Rate",
        type: "number",
        required: true,
        width: "150px",
        maxWidth: "150px",
        size: "xs",
        rounded: "full",
        placeholder: "Enter selling rate"
    },

    {
        name: "ACTIVE",
        label: "Active",
        required: true,
        width: "100px",
        maxWidth: "100px",
        rounded: "full",
        options: YesOrNo,
        type: "select",
        defaultValue: "Y",
        size: "xs"
    }
];