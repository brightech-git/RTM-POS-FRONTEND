export interface Vendor {

    VENDORCODE?: number;

    VENDORNAME: string;
    MIDDLENAME?: string;
    LASTNAME?: string;

    PANNO?: string;
    TINNO?: string;
    CSTNO?: string;
    GSTNUMBER?: string;
    HSNSTATECODE?: string;

    ADDRESS1: string;
    ADDRESS2?: string;
    ADDRESS3?: string;

    AREA: string;
    CITY: string;
    DISTRICT: string;
    STATE: string;
    COUNTRY: string;

    PINCODE: string;

    PHONENO?: string;
    MOBILENO: string;
    EMAILID?: string;

    PHONENO2?: string;
    MOBILENO2?: string;
    EMAILID2?: string;

    CONTACTPERSON: string;
    REMARKS?: string;

    ACTIVE: string;

    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

export interface VendorForm {

    VENDORNAME: string;
    MIDDLENAME?: string;
    LASTNAME?: string;

    PANNO?: string;
    TINNO?: string;
    CSTNO?: string;
    GSTNUMBER?: string;
    HSNSTATECODE?: string;

    ADDRESS1: string;
    ADDRESS2?: string;
    ADDRESS3?: string;

    AREA: string;
    CITY: string;
    DISTRICT: string;
    STATE: string;
    COUNTRY: string;

    PINCODE: string;

    PHONENO?: string;
    MOBILENO: string;
    EMAILID?: string;

    PHONENO2?: string;
    MOBILENO2?: string;
    EMAILID2?: string;

    CONTACTPERSON: string;
    REMARKS?: string;

    ACTIVE: string;
}

export type AllVendors = Vendor[];