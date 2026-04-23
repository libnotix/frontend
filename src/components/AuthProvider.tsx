"use client";

import { User } from "@/api";
import { createContext, useContext } from "react";

export const AuthContext = createContext<User>({
    id: 0,
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    createdAt: new Date(),
});

export const AuthProvider = ({
    user,
    children,
}: {
    user: User;
    children: React.ReactNode;
}) => {
    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
