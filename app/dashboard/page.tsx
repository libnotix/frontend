"use client"
import { memo, useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import Link from "next/link";

const DashboardPage = () => {
    const user = useContext(AuthContext);

    return (
        <div className="flex justify-between flex-row gap-4 container mx-auto pt-10">
            <h1 className="text-4xl font-bold ">Üdv, {user?.firstName}!</h1>
            <Link href="dashboard/classes/classlist" className="w-100 h-100 bold border-1px-solid text-2xl cursor-pointer font-bold hover:opacity-80 transition-opacity">Osztályok</Link>
        </div>
    );
};

export default memo(DashboardPage); 