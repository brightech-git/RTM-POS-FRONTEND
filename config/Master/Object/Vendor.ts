import { FormField } from "@/types/form/form";
import { YesOrNo } from "@/data/YesOrNo/YesOrNoTypes";

export const VendorConfig: FormField[] = [

{
    name: "VENDORNAME",
    label: "Vendor Name",
    type: "text",
    required: true,
    width: "200px",
    size: "xs",
    rounded: "full",
    placeholder: "Enter vendor name"
},

{
    name: "MIDDLENAME",
    label: "Middle Name",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "LASTNAME",
    label: "Last Name",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "PANNO",
    label: "PAN No",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "TINNO",
    label: "TIN No",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "CSTNO",
    label: "CST No",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "GSTNUMBER",
    label: "GST Number",
    type: "text",
    width: "180px",
    size: "xs",
    rounded: "full"
},

// {
//     name: "HSNSTATECODE",
//     label: "HSN State Code",
//     type: "text",
//     width: "120px",
//     size: "xs",
//     rounded: "full"
// },

{
    name: "ADDRESS1",
    label: "Address 1",
    type: "text",
    required: true,
    width: "250px",
    size: "xs",
    rounded: "full"
},

{
    name: "ADDRESS2",
    label: "Address 2",
    type: "text",
    width: "250px",
    size: "xs",
    rounded: "full"
},

{
    name: "ADDRESS3",
    label: "Address 3",
    type: "text",
    width: "250px",
    size: "xs",
    rounded: "full"
},

{
    name: "AREA",
    label: "Area",
    type: "text",
    required: true,
    width: "180px",
    size: "xs",
    rounded: "full"
},

{
    name: "CITY",
    label: "City",
    type: "text",
    required: true,
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "DISTRICT",
    label: "District",
    type: "text",
    required: true,
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "STATE",
    label: "State",
    type: "text",
    required: true,
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "COUNTRY",
    label: "Country",
    type: "text",
    required: true,
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "PINCODE",
    label: "Pincode",
    type: "text",
    required: true,
    width: "120px",
    size: "xs",
    rounded: "full"
},

{
    name: "PHONENO",
    label: "Phone No",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "MOBILENO",
    label: "Mobile No",
    type: "text",
    required: true,
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "EMAILID",
    label: "Email",
    type: "text",
    width: "200px",
    size: "xs",
    rounded: "full"
},

{
    name: "PHONENO2",
    label: "Phone No 2",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "MOBILENO2",
    label: "Mobile No 2",
    type: "text",
    width: "150px",
    size: "xs",
    rounded: "full"
},

{
    name: "EMAILID2",
    label: "Email 2",
    type: "text",
    width: "200px",
    size: "xs",
    rounded: "full"
},

{
    name: "CONTACTPERSON",
    label: "Contact Person",
    type: "text",
    required: true,
    width: "200px",
    size: "xs",
    rounded: "full"
},

{
    name: "REMARKS",
    label: "Remarks",
    type: "text",
    width: "250px",
    size: "xs",
    rounded: "full"
},

{
    name: "ACTIVE",
    label: "Active",
    type: "select",
    options: YesOrNo,
    defaultValue: "Y",
    width: "100px",
    size: "xs",
    rounded: "full"
}

];