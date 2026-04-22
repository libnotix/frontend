"use client";

import { memo, ReactNode } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User } from "@/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout04Icon } from "@hugeicons/core-free-icons";
import { logout } from "@/actions/auth";
import Link from "next/link";

const DashboardNavbar = ({
    user,
}: {
    user: User;
}): ReactNode => {
    return (
        <div className="w-full sticky p-3 top-0 left-0 flex justify-center bg-accent border-b-2 border-orange-400">
            <nav className="h-16 flex items-center justify-between container">
                <h1 className="text-xl font-bold  cursor-pointer hover:opacity-80 transition-opacity"><Link href="/dashboard">TanárSegéd</Link></h1>

                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <p className="text-sm font-medium">{user.firstName + " " + user.lastName}</p>

                            <Avatar>
                                <AvatarFallback>{(user.firstName || "P").charAt(0) + (user.lastName || "F").charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                            <HugeiconsIcon icon={Logout04Icon} size={16} />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </nav>
        </div>
    );
}

export default memo(DashboardNavbar);