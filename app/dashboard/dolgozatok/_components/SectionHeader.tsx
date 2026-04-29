"use client";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
   label: string;
   helper?: string;
   error?: string;
   className?: string;
};

export function SectionHeader({ label, helper, error, className }: SectionHeaderProps) {
   return (
      <div className={cn("mb-3 space-y-1", className)}>
         <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
         {helper ? <p className="text-xs leading-snug text-muted-foreground/80">{helper}</p> : null}
         {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
   );
}
