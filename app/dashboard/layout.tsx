import { getSession } from "@/lib/auth-server";
import { AuthProvider } from "@/components/AuthProvider";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/Navbar";

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
        <div className="flex flex-col h-screen">
            <DashboardNavbar user={session.user} />

            <AuthProvider user={session.user}>
                <div className="flex flex-col flex-1 min-h-0">
                    {children}
                </div>
            </AuthProvider>
        </div>
    );
}