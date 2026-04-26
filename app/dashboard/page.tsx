"use client";

import { memo, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { AuthContext } from "@/components/AuthProvider";
import DashboardLayoutGrid from "@/components/dashboard/DashboardLayoutGrid";
import { api } from "@/lib/api";

interface Draft {
  id: string;
  title: string;
  format: string;
  updatedAt: string;
  createdAt: string;
}
/** Narrow left-column tiles: icon + chevron row, then title and description */
function HomeFeatureLink({
  href,
  icon: Icon,
  title,
  description,
  iconWrapperClassName,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  iconWrapperClassName: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-1 flex-col gap-3 bg-card/90 p-5 transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset min-h-[140px] lg:min-h-0 lg:flex-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconWrapperClassName}`}
        >
          <Icon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>
        <ChevronRight
          className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </p>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}

const DashboardPage = () => {
  const user = useContext(AuthContext);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.draftsGetRaw();
        const data = await res.raw.json();
        const draftsArray = data?.drafts || data;
        if (!cancelled && Array.isArray(draftsArray)) {
          setDrafts(draftsArray);
        }
      } catch (error) {
        console.error("Failed to fetch drafts", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const recentDrafts = useMemo(() => {
    return [...drafts]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 3);
  }, [drafts]);

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <DashboardLayoutGrid />

      <div className="relative z-10 container mx-auto flex-1 px-7 pt-10 pb-16">
        <h1 className="mb-10 text-4xl font-bold tracking-tight">
          Üdv, {user?.firstName}!
        </h1>

        <section
          aria-labelledby="modules-heading"
          className="flex flex-col gap-6"
        >
          <h2 id="modules-heading" className="sr-only">
            Modulok
          </h2>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/40 shadow-sm grid grid-cols-1 divide-y divide-border/80 lg:grid-cols-[1fr_2fr_1fr] lg:divide-y-0 lg:divide-x">
            {/* Left 1× — vázlatok + dolgozatok */}
            <div className="flex min-h-0 flex-col divide-y divide-border/80 bg-card/30">
              <HomeFeatureLink
                href="/dashboard/vazlatok"
                icon={BookOpen}
                title="Vázlatok"
                description="Cikkek és dokumentumok — megnyitás, szerkesztés, új létrehozása"
                iconWrapperClassName="bg-primary/10 text-primary"
              />
              <HomeFeatureLink
                href="/dashboard/dolgozatok"
                icon={ClipboardList}
                title="Dolgozatok"
                description="Hamarosan: feladatok, osztályzás és visszajelzés egy helyen"
                iconWrapperClassName="bg-chart-2/15 text-chart-2"
              />
            </div>

            {/* Center 2× — legutóbbi vázlatok */}
            <div className="p-5 md:p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Legutóbb szerkesztve
              </p>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-9 w-9 animate-spin text-primary/40" />
                </div>
              ) : recentDrafts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/80 bg-background/60 px-4 py-4 text-sm text-muted-foreground">
                  Még nincs vázlat. A bal oldali Vázlatok mezőre kattintva
                  megnyithatod a listát, és létrehozhatsz egy újat.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentDrafts.map((draft) => (
                    <li key={draft.id}>
                      <Link
                        href={`/dashboard/vazlatok/${draft.id}`}
                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-4 py-3.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {draft.title || "Névtelen vázlat"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(draft.updatedAt).toLocaleString(
                              "hu-HU",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              },
                            )}
                          </p>
                        </div>
                        <ChevronRight
                          className="h-5 w-5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right 1× — reserved */}
            <div className="flex min-h-32 flex-col justify-center bg-card/20 p-5 md:p-6 lg:min-h-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Továbbiak
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ide kerülnek a későbbi modulok.
                <br />
                Stay tuned!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default memo(DashboardPage);

