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
        width: '200px',
        maxWidth: '200px',
        size: 'xs',
        rounded: 'full',
        
    },
    {
        name: "SHORTNAME",
        label: "Short Name",
        type: "text",
        required: true,
        width: '200px',
        size: 'xs',
        rounded: 'full',
    },
    {
        name: "SUBPRODUCT",
        label: "Sub Product",
        required: true,
        width: '200px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'Y',
        size: 'xs'

    },
    {
        name: "UNITCODE",
        label: "Selling Unit",
        required: true,
        width: '200px',
        rounded: 'full',
        options: sellingUnit,
        type: 'select',
        defaultValue: 'P',
        size: 'xs'

    },
    {
        name: "PUREUNITCODE",
        label: "Purchase Unit",
        required: true,
         width: '200px',
        rounded: 'full',
        options: sellingUnit,
        type: 'select',
        defaultValue: 'P',
        size: 'xs'

    },
    {
        name: "PRODUCTTYPE",
        label: "Product Type",
        required: true,
        width: '200px',
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
    type: "select",
    options: TagType,
    defaultValue: "S",
    size: "xs",
    disabled: product === "N",
     width: '200px',
},
{
    name: "ORIONBARCODE",
    label: "Orion Barcode",
    required: true,
    type: "select",
    options: YesOrNo,
    defaultValue: "Y",
    size: "xs",
    disabled: product === "N",
     width: '200px',
},
    {
        name: "ALLOWDISCOUNT",
        label: "Allow Discount",
        required: true,
         width: '200px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'N',
        size: 'xs'

    },
    {
        name: "EXPIRYDAYS",
        label: "Expiry Days",
        required: true,
         width: '200px',
        rounded: 'full',
        type: 'text',
        size: 'xs'

    },
    {
        name: "ACTIVE",
        label: "Active",
        required: true,
         width: '200px',
        rounded: 'full',
        options: YesOrNo,
        type: 'select',
        defaultValue: 'Y',
        size: 'xs'

    }
]