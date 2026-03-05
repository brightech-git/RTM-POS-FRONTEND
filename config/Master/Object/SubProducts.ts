// config/Master/Object/SubProducts.ts
import { FormField } from "@/types/form/form";
import { YesOrNo } from "@/data/YesOrNo/YesOrNoTypes";

export const SubProductConfig = (products: any[] = []): FormField[] => [
    
    
      {
        name: "PRODUCTCODE",
        label: "Product Name",
        required: true,
        width: '180px',
        maxWidth: '180px',
        rounded: 'full',
        type: 'select',
        size: 'xs',
        options: products.map(p => ({
            value: p.PRODUCTCODE, // This will be string after our mapping
            label: `${p.PRODUCTNAME} (${p.SHORTNAME})`
        })),
        placeholder: "Select parent product"
    },
    {
        name: "SUBPRODUCTNAME",
        label: "Sub Product Name",
        type: "text",
        required: true,
        autoFocus: true,
        width: '200px',
        maxWidth: '200px',
        size: 'xs',
        rounded: 'full',
        placeholder: "Enter sub product name"
    },
    {
        name: "SHORTNAME",
        label: "Short Name",
        type: "text",
        required: true,
        width: '150px',
        maxWidth: '150px',
        size: 'xs',
        rounded: 'full',
        placeholder: "Enter short name"
    },
  
    {
        name: "ACTIVE",
        label: "Active",
        required: true,
        width: '100px',
        maxWidth: '100px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'Y',
        size: 'xs'
    }
];