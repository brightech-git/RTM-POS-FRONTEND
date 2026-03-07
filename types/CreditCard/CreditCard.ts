export interface CreditCard {
    CARDCODE?: number;
    CARDNAME: string;
    ACTIVE: string;
    CREATEDBY?: number;
    CREATEDDATE?: string;
    CREATEDTIME?: string;
}

export type CreditCardCollection = CreditCard[];