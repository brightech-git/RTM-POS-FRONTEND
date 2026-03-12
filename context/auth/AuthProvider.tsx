"use client";

import React, { useEffect, useState } from "react";
import { AuthContext, AuthUser } from "./AuthContext";
import { authService, LoginPayload, ApiResponse as AuthApiResponse } from "@/service/AuthService";
import { CompanyService, Company, ApiResponse } from "@/service/CompanyService";
import { getStorage, removeStorage, setStorage } from "@/utils/storage/storage";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [companiesData, setCompaniesData] = useState<Company[]>([]);

    // 🔄 fetch user
    // const refreshUser = async (uid: number) => {
    //     setLoading(true);
    //     const res = await authService.me(uid);
    //     console.log(res, 'fetching user data')

    //     if (res.success) {
    //         setUser(res.data);
    //     }
    //     //  else {
    //     //     logout();
    //     // }
    //     setLoading(false);
    // };

    // 🏢 company list
   const company = async () => {
    try {
        const res = await CompanyService.getAll(); // res is Company[]
        setCompaniesData(res || []);
    } catch {
        setCompaniesData([]);
    }
};

    useEffect(() => {
        company();
    }, []);

    // 🔐 LOGIN
   const login = async (payload: LoginPayload): Promise<ApiResponse<AuthUser>> => {
    setLoading(true);
    
    const res = await authService.login(payload);

    // ❌ LOGIN FAILED
    if (!res.data) {
        setLoading(false);
        return {
            data: {} as AuthUser,   // Or `null` if you allow it
            message: res.message,
            status: "error",
        };
    }

    // ✅ LOGIN SUCCESS
    const userId = res.data.OPER_CODE;
    const isAdmin = res.data.ISADMIN;

    setStorage("userId", String(userId));
    setStorage("admin", isAdmin);
    setUserId(userId);
    setUser(res.data);

    setLoading(false);
    return {
        data: res.data,        // Must include `data`
        message: res.message,
        status: "success",
    };
};



    // 🚪 LOGOUT
    const logout = () => {
        setUser(null);
        setUserId(null);
        removeStorage("userId");
        removeStorage("admin");
        window.location.href = "/login";
    };

    // ♻ restore session
    useEffect(() => {
        const storedUserId = getStorage("userId");
        if (storedUserId) {
            const uid = Number(storedUserId);
            setUserId(uid);
            // refreshUser(uid);
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                userId,
                loading,
                login,
                logout,
                // refreshUser,
                company,
                companiesData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
