"use client"
import { memo, useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";

const DashboardPage = () => {
    const user = useContext(AuthContext);

    return (
        <div className="flex flex-col gap-4 container mx-auto pt-10">
            <h1 className="text-4xl font-bold">Üdv, {user?.firstName}!</h1>
        </div>
    );
};

export default memo(DashboardPage); 