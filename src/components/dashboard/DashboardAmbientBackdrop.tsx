import { cn } from "@/lib/utils";

/**
 * Ugyanaz a színes blur-háttér, mint a vázlatok szerkesztőjénél
 * (`app/dashboard/vazlatok/[id]/page.tsx`), hogy a lista- és eszközfelületek vizuálisan illeszkedjenek.
 */
export function DashboardAmbientBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -top-[20%] -left-[10%] w-[45%] h-[50%] rounded-full bg-blue-400/15 dark:bg-blue-500/10 blur-[120px]" />
      <div className="absolute top-[10%] right-[5%] w-[35%] h-[40%] rounded-full bg-emerald-400/12 dark:bg-emerald-500/8 blur-[100px]" />
      <div className="absolute top-[50%] -left-[5%] w-[30%] h-[35%] rounded-full bg-orange-400/12 dark:bg-orange-500/8 blur-[110px]" />
      <div className="absolute bottom-[5%] right-[15%] w-[40%] h-[35%] rounded-full bg-rose-400/10 dark:bg-rose-500/7 blur-[100px]" />
      <div className="absolute -bottom-[10%] left-[25%] w-[35%] h-[30%] rounded-full bg-yellow-400/10 dark:bg-yellow-500/7 blur-[90px]" />
    </div>
  );
}
