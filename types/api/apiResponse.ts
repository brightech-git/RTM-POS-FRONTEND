export interface ApiResponse<T> {
    CARDNAME: string;
    ACTIVE: string;
    status: boolean;
    message: string;
    data: T;
}