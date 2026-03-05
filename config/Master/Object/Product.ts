import { sellingUnit ,TagType ,TaggedOrNonTagged } from "@/data/product/ProductData";
import { YesOrNo } from "@/data/YesOrNo/YesOrNoTypes";
import { FormField } from "@/types/form/form";

export const ProductConfig = (product:string,  editId: string|number|null): FormField[] =>[
    {
        name:"PRODUCTNAME",
        label:"Product Name",
        type:"text",
        required:true,
        autoFocus:true,
        width: '110px',
        maxWidth: '110px',
        size: 'xs',
        rounded: 'full',
  
    },
    {
        name: "SHORTNAME",
        label: "Sub Product",
        type: "text",
        required: true,
        width: '110px',
        maxWidth: '110px',
        size: 'xs',
        rounded: 'full',
    },
    {
        name: "SUBPRODUCT",
        label: "Sub Product",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'Y',
        size: 'xs'

    },
    {
        name: "SELLINGUNIT",
        label: "Selling Unit",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: sellingUnit,
        type: 'select',
        defaultValue: 'P',
        size: 'xs'

    },
    {
        name: "PURCHASEUNIT",
        label: "Purchase Unit",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: sellingUnit,
        type: 'select',
        defaultValue: 'P',
        size: 'xs'

    },
    {
        name: "PRODUCT TYPE",
        label: "Product Type",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: TaggedOrNonTagged,
        type: 'select',
        defaultValue: 'T',
        size: 'xs'

    },
    {
        name: "TAGTYPE",
        label: "Tag Type",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: TagType,
        type: 'select',
        defaultValue: 'S',
        size: 'xs'

    },
    {
        name: "ORIONBARCODE",
        label: "Orion Barcode",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'Y',
        size: 'xs'

    },
    {
        name: "ALLOWDISCOUNT",
        label: "Allow Discount",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'N',
        size: 'xs'

    },
    {
        name: "EXPIRYDATES",
        label: "Expiry Date",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        type: 'text',
        size: 'xs'

    },
    {
        name: "ACTIVE",
        label: "Active",
        required: true,
        width: '110px',
        maxWidth: '110px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'Y',
        size: 'xs'

    }
]