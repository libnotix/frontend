import { memo } from "react";

/**
 * Fixed viewport guides: one track aligned with dashboard `container` + `px-7`,
 * subdivided 1 : 2 : 1 (left / center / right). Behind content; pointer-events none.
 */
const DashboardLayoutGrid = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-1 flex justify-center"
      aria-hidden
    >
      <div className="container mx-auto flex h-full max-w-full px-7">
        <div className="flex h-full w-full border-x border-border/40">
          <div className="grid h-full w-full grid-cols-[1fr_2fr_1fr]">
            <div className="border-r border-border/25" />
            <div className="border-r border-border/25" />
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DashboardLayoutGrid);
