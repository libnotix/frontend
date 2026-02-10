import { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    showBack?: boolean;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <div className="w-full max-w-[400px] animate-fade-in-up">
                <div className="flex flex-col space-y-2 text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}
