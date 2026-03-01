import { getSession } from "@/lib/auth-server";
import { AuthProvider } from "@/components/AuthProvider";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/Navbar";
import Link from "next/link";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    return (
        <div className="flex flex-col">
            <DashboardNavbar user={session.user} />

            <AuthProvider user={session.user}>
                {children}
            </AuthProvider>

            <Link href="dashboard/classes/classcreate" className="w-100 h-100 border-1px-solid">gonb</Link>
        </div>
    );
}