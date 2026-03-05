import { axiosInstance } from "@/api/axiosInstance";

export interface ApiResponse<T = any> {
    success?: boolean;
    message?: string;
    data?: T;
}

// This interface matches your actual API response
export interface Employee {
    EMPNAME: string;
    EMPSURNAME: string;
    EMPFATHERNAME: string;
    SALUTATION: string;
    DESIGNATIONCODE?: number; // <-- add this line
    DOORNO: string;
    STREET: string;
    ADDRESS: string;
    AREA: string;
    CITY: string;
    STATE: string;
    PINCODE: string;
    PHONENO: string;
    MOBILENO: string;
    ACTIVE: string;
    CREATEDBY: number;
    // Add EMPUID or other fields if needed
}

// For create/update payload - you can use the same interface
export type CreateEmployeePayload = Employee;

export const EmployeeService = {
    // GET ALL
    getAll: async (): Promise<Employee[]> => {
        const { data } = await axiosInstance.get("/employee/all");
        return data; // The API returns array directly
    },

    // CREATE
 create: async (payload: CreateEmployeePayload): Promise<Employee> => {
    const { data } = await axiosInstance.post(
        "/employee/create",
        payload
    );

    console.log("Employee created:", data); // Debug log
    return data;
},

    // UPDATE
    update: async (payload: CreateEmployeePayload): Promise<Employee> => {
        const { data } = await axiosInstance.put(
            "/employee/update",
            payload
        );
        return data;
    },

    // DELETE
    deleteById: async (empId: string): Promise<string> => {
        const { data } = await axiosInstance.delete(
            `/employee/delete/${empId}`
        );
        return data;
    },
};