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
import { logout } from "@/actions/auth";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { AnimatedIsland } from "./AnimatedIsland";

const DashboardNavbar = ({ user }: { user: User }): ReactNode => {
  return (
    <div className="w-full sticky top-0 left-0 flex justify-center bg-accent z-50">
      <nav className="h-16 flex items-center justify-between container relative">
        <Link href="/dashboard" className="text-xl font-bold">
          TanárSegéd
        </Link>

        {/* Dynamic Island (Desktop) */}
        <AnimatedIsland isDesktop={true} />

        {/* Dynamic Island (Mobile) */}
        <AnimatedIsland isDesktop={false} />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <p className="text-sm font-medium">
                {user.firstName + " " + user.lastName}
              </p>

              <Avatar>
                <AvatarFallback>
                  {(user.firstName || "P").charAt(0) +
                    (user.lastName || "F").charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
};

export default memo(DashboardNavbar);
