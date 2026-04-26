"use client";

import { memo, Suspense } from "react";
import { DolgozatListPage } from "./_components/DolgozatListPage";
import { Loader2 } from "lucide-react";

const ListFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
    <Loader2 className="size-5 animate-spin" />
    <span>Betöltés...</span>
  </div>
);

const DolgozatokPage = () => (
  <Suspense fallback={<ListFallback />}>
    <DolgozatListPage />
  </Suspense>
);

export default memo(DolgozatokPage);
