"use client";

import { memo, ReactNode } from "react";
import { usePathname } from "next/navigation";
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

/** Single-segment id under /dashboard/vazlatok — draft editor, not the list route. */
const DRAFT_EDITOR_PATH = /^\/dashboard\/vazlatok\/[^/]+$/;

const DashboardNavbar = ({ user }: { user: User }): ReactNode => {
  const pathname = usePathname();
  const overlayNavbar = pathname != null && DRAFT_EDITOR_PATH.test(pathname);

  return (
    <div
      className={
        overlayNavbar
          ? "pointer-events-none absolute top-0 left-0 right-0 z-50 flex w-full justify-center"
          : "sticky top-0 left-0 z-50 flex w-full justify-center"
      }
    >
      <nav className="pointer-events-auto h-16 flex items-center gap-3 container bg-accent/70 backdrop-blur-md px-7 mt-4 rounded-full border-4 shadow-xl overflow-clip">
        {/* Left: logo + left island */}
        <Link href="/dashboard" className="text-xl font-bold shrink-0">
          TanárSegéd
        </Link>
        <AnimatedIsland isDesktop={true} slot="left" />
        <AnimatedIsland isDesktop={false} slot="left" />

        {/* Center: fills remaining space, islands centered within */}
        <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
          <AnimatedIsland isDesktop={true} />
          <AnimatedIsland isDesktop={false} />
          <AnimatedIsland isDesktop={true} slot="center" />
          <AnimatedIsland isDesktop={false} slot="center" />
        </div>

        {/* Right: right island + user menu */}
        <AnimatedIsland isDesktop={true} slot="right" />
        <AnimatedIsland isDesktop={false} slot="right" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
              <p className="text-sm font-medium whitespace-nowrap">
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
