# TanárSegéd — Frontend design principles

**Language:** [Magyar (HU)](DESIGN_PRINCIPLES.hu.md)

This document is the **visual and structural contract** for dashboard work. Follow it so new screens feel consistent with the existing app (navbar, layout, routing, and component styling).

---

## 1. Navbar dynamic islands (Apple-inspired)

The dashboard navbar is a **pill-shaped bar** with **mount points (“islands”)** that change meaning per route. Page-level UI (actions, context, navigation) should **populate those islands** instead of duplicating a second global toolbar.

**What to use**

- **`DynamicIsland`** — legacy single **center** mount (prefer slots for new work when you need left/center/right).
- **`DynamicIslandSlot`** with `slot="left" | "center" | "right"` — render page-specific controls into the matching region. Content is **portaled** into the navbar; islands **animate** to fit their children (see `AnimatedIsland`).

**Rules**

1. **Per-page content**: Each route (or feature) decides what appears in each slot — e.g. draft editor titles and save actions in **`DraftDynamicIsland`**, list pages might use **left** for back/context and **center** for search/filter when needed.
2. **Leave slots empty** when there is nothing to show; do not leave placeholder chrome that fights the navbar shape.
3. **Responsive**: Islands exist for **desktop and mobile** mount targets; keep controls usable on small widths (the same slot API applies; test at the `md` breakpoint used in code (~768px)).
4. **Implementation detail**: Slots are wired through **`useNavbarStore`** (`src/store/navbarStore.ts`). Unmounting your component should clear island content naturally via React teardown.

**References in code**: `src/components/dashboard/Navbar.tsx`, `DynamicIsland.tsx`, `DynamicIslandSlot.tsx`, `AnimatedIsland.tsx`, and example usage in `app/dashboard/vazlatok/[id]/DraftDynamicIsland.tsx`.

---

## 2. Page layout and routing structure

Treat **`app/dashboard/page.tsx`** as the **baseline** for how a “full” dashboard surface should feel:

- **Background grid** — use **`DashboardLayoutGrid`** for main dashboard views where the **1 : 2 : 1** column guides should align with content (fixed guides behind the scrollable page).
- **Content width** — prefer the same **container + horizontal padding** vocabulary as the home dashboard (e.g. `container mx-auto` with **`px-7`**, vertical rhythm like **`pt-10` / `pb-16`** where it matches). Tighter listing pages may use a **`max-w-*`** wrapper; stay on the same **token-based** borders and cards (see §3).
- **Sections** — large modules use **rounded containers**, **subtle borders** (`border-border/…`), **card backgrounds** (`bg-card`, `bg-card/40`), and clear **typography hierarchy** (`text-4xl` headings, `text-muted-foreground` for secondary copy), consistent with the home dashboard module grid.

**Route shape (Next.js App Router)**

| Purpose | Pattern | Example |
|--------|---------|---------|
| Dashboard hub | `app/dashboard/page.tsx` | Current home |
| **Listing** (collection) | `app/dashboard/<segment>/page.tsx` | `vazlatok/page.tsx`, `dolgozatok/page.tsx` |
| **Detail** (single item) | `app/dashboard/<segment>/[id]/page.tsx` (or other dynamic segments as needed) | `vazlatok/[id]/page.tsx`, `classes/[id]/page.tsx` |

When you add a new resource:

1. Add a **listing** route for the collection.
2. Add a **dynamic segment** route for a single record **only** where the product needs a dedicated screen (`[id]`, `[slug]`, etc. — match what the API and UX require).
3. Link listings to details with **`<Link href={...}>`** paths that mirror that file structure (e.g. `/dashboard/vazlatok/${id}`).

Do **not** introduce ad-hoc parallel URL schemes for the same entity; **one obvious path** per listing and per detail view.

---

## 3. shadcn-oriented styling

The UI stack is **Tailwind** plus **shadcn-style** primitives under **`src/components/ui/`** (Radix-based patterns, **CVA**, **`tailwind-merge`**).

**Rules**

1. **Prefer existing primitives** — `Button`, `Card`, `DropdownMenu`, `Input`, dialogs, etc. from `src/components/ui/` rather than one-off styled `<div>` / `<button>` when a component already exists.
2. **Use design tokens** — semantic classes such as **`bg-card`**, **`text-foreground`**, **`text-muted-foreground`**, **`border-border`**, **`ring-ring`**, **`bg-primary`**, **`text-primary-foreground`**, **`rounded-xl` / `rounded-2xl`** in line with current screens. Avoid hard-coded hex colors except rare, token-backed exceptions.
3. **Focus and motion** — follow established patterns: **`focus-visible:ring-2 focus-visible:ring-ring`**, hover states that use **`muted`** / **`primary`** steps, and **Framer Motion** only where the rest of the feature already uses it (e.g. islands).
4. **Icons** — **`lucide-react`** (and project conventions for size/stroke) for consistency with the navbar and dashboard.

If a mockup conflicts with these tokens, **adapt the mockup** to the shadcn/tailwind token set rather than introducing a second styling system.

---

## 4. Quick checklist for new screens

- [ ] Navbar islands: **left / center / right** populated or intentionally empty; no duplicate top bars.
- [ ] Layout and density **match dashboard + listing/detail** patterns; **`DashboardLayoutGrid`** where appropriate.
- [ ] URLs follow **`/dashboard/...`** listing and **`[dynamic]/page.tsx`** detail conventions.
- [ ] Styling uses **`src/components/ui`** and **semantic Tailwind tokens** (shadcn style).

For environment and API details, see **[Developer Guide](DEV_GUIDE.en.md)**.
