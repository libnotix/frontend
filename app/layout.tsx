import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "../src/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "TanárSegéd",
  description:
    "Digitális segítőtárs pedagógusoknak – kevesebb adminisztráció, több idő a diákokra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className={cn(inter.variable, "min-h-full flex")} >
      <body
        className={`${inter.className} antialiased dark min-h-full w-full`}
      >
        <QueryProvider>
          {children}
          <Toaster richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
