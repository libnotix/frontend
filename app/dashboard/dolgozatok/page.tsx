"use client";

import { memo } from "react";
import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";

const DolgozatokPage = () => {
  return (
    <div className="relative z-10 container mx-auto max-w-2xl px-7 py-10 pb-16">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Vissza a kezdőlapra
      </Link>

      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-chart-2/15 text-chart-2">
          <ClipboardList className="h-11 w-11" strokeWidth={1.5} aria-hidden />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Dolgozatok</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Ez a szekció hamarosan érkezik: dolgozatok létrehozása, kiosztása és
          nyomon követése egy helyen.
        </p>
      </div>
    </div>
  );
};

export default memo(DolgozatokPage);
