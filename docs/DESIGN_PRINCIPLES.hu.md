# TanárSegéd — Frontend tervezési elvek

**Nyelv:** [English (EN)](DESIGN_PRINCIPLES.en.md)

Ez a dokumentum a **dashboard-felületek vizuális és szerkezeti szerződése**. Kövesd, hogy az új képernyők illeszkedjenek a létező alkalmazáshoz (navbar, elrendezés, útválasztás, komponens-stílus).

---

## 1. Navbar dinamikus „szigetek” (Apple-inspiráció)

A dashboard navigációs sávja **„tabletta” formájú**, **rögzítési pontokkal („szigetek”)**, amelyek **útvonalanként** változnak. Az oldalszintű UI (műveletek, kontextus, navigáció) ezeket a szigeteket **töltse ki**, ne hozz létre második, globális eszköztárat.

**Mit használj**

- **`DynamicIsland`** — örökölt egyetlen **középső** rögzítési pont (új funkciókhoz inkább a slotok, ha kell bal/közép/jobb).
- **`DynamicIslandSlot`** `slot="left" | "center" | "right"` értékkel — oldal-specifikus vezérlők a megfelelő régióba. A tartalom **portál** a navbarba; a szigetek **animálva** igazodnak a gyerekekhez (lásd `AnimatedIsland`).

**Szabályok**

1. **Oldalankénti tartalom**: Minden útvonal (vagy funkció) dönti el, mi jelenik meg a slotokban — pl. vázlatszerkesztő cím és mentés a **`DraftDynamicIsland`**-ben; listaoldalakon **bal** oldalon vissza/kontextus, **középen** keresés/szűrés, ha kell.
2. **Üres slot**, ha nincs megjeleníthető tartalom; ne hagyj felesleges „krómot”, ami ütközik a navbar formájával.
3. **Reszponzivitás**: Desktop és mobil rögzítési célok; kis szélességen is használható vezérlők (ugyanaz a slot API; teszteld a kódbeli `md` töréspontot, kb. 768px).
4. **Megvalósítás**: A slotok a **`useNavbarStore`**-on keresztül vannak kötve (`src/store/navbarStore.ts`). A komponens unmountja a React lebontásával ürítheti a sziget tartalmát.

**Kódhivatkozások**: `src/components/dashboard/Navbar.tsx`, `DynamicIsland.tsx`, `DynamicIslandSlot.tsx`, `AnimatedIsland.tsx`, példa: `app/dashboard/vazlatok/[id]/DraftDynamicIsland.tsx`.

---

## 2. Oldal-elrendezés és útválasztás

Az **`app/dashboard/page.tsx`** a **referencia**, hogyan érződjön egy „teljes” dashboard felület:

- **Háttétrács** — **`DashboardLayoutGrid`** fő dashboard nézetekhez, ahol a **1 : 2 : 1** oszlopvezetők illeszkedjenek a tartalomhoz (rögzített vezetők a görgethető tartalom mögött).
- **Tartalom szélessége** — azonos **container + vízszintes padding** nyelv, mint a kezdő dashboardon (pl. `container mx-auto`, **`px-7`**, függőleges ritmus **`pt-10` / `pb-16`**, ahol passzol). Szűkebb listák használhatnak **`max-w-*`** csomagolót; maradj a **token-alapú** kereteknél és kártyáknál (lásd §3).
- **Szakaszok** — nagy modulok **lekerekített** konténerek, **finom keretek** (`border-border/…`), **kártya háttér** (`bg-card`, `bg-card/40`), egyértelmű **tipográfiai hierarchia** (`text-4xl` címek, `text-muted-foreground` másodlagos szöveg), összhangban a kezdő modulráccsal.

**Útvonal forma (Next.js App Router)**

| Cél | Minta | Példa |
|-----|--------|--------|
| Dashboard központ | `app/dashboard/page.tsx` | Jelenlegi kezdőlap |
| **Lista** (gyűjtemény) | `app/dashboard/<szegmens>/page.tsx` | `vazlatok/page.tsx`, `dolgozatok/page.tsx` |
| **Részlet** (egy elem) | `app/dashboard/<szegmens>/[id]/page.tsx` (vagy más dinamikus szegmens) | `vazlatok/[id]/page.tsx`, `classes/[id]/page.tsx` |

Új erőforrás hozzáadásakor:

1. **Lista** útvonal a gyűjteményhez.
2. **Dinamikus szegmens** az egy rekordhoz **csak** ott, ahol külön képernyő kell (`[id]`, `[slug]` stb. — egyezzen az API-val és a UX-szel).
3. Listából részletekre **`Link href={...}`** útvonalak, amelyek tükrözik a fájlstruktúrát (pl. `/dashboard/vazlatok/${id}`).

Ne vezess be **véletlenszerű párhuzamos URL-sémákat** ugyanahhoz az entitáshoz; **egy egyértelmű út** listához és részlethez.

---

## 3. shadcn-kompatibilis stílus

A UI réteg **Tailwind** plusz **shadcn-jellegű** primitívek: **`src/components/ui/`** (Radix-alapú minták, **CVA**, **`tailwind-merge`**).

**Szabályok**

1. **Létező primitívek** — `Button`, `Card`, `DropdownMenu`, `Input`, dialógusok stb. a `src/components/ui/`-ból, ne egyedi stílusú `<div>` / `<button>`, ha már van komponens.
2. **Design tokenek** — szemantikus osztályok: **`bg-card`**, **`text-foreground`**, **`text-muted-foreground`**, **`border-border`**, **`ring-ring`**, **`bg-primary`**, **`text-primary-foreground`**, **`rounded-xl` / `rounded-2xl`**, ahogy a meglévő képernyők. Kerüld a kemény hex színeket, kivéve ritka, tokenhez kötött esetet.
3. **Fókusz és mozgás** — bevált minták: **`focus-visible:ring-2 focus-visible:ring-ring`**, hover **`muted`** / **`primary`** lépcsőkkel, **Framer Motion** csak ott, ahol a funkció már használja (pl. szigetek).
4. **Ikonok** — **`lucide-react`** (méret/vonal a projektkonvenció szerint), egységesen a navbarral és dashboarddal.

Ha egy mockup ütközik ezekkel a tokenekkel, **igazítsd a mockupot** a shadcn/tailwind token készlethez, ne második stílusrendszert.

---

## 4. Gyors ellenőrzőlista új képernyőkhöz

- [ ] Navbar szigetek: **bal / közép / jobb** kitöltve vagy szándékosan üres; nincs duplikált felső sáv.
- [ ] Elrendezés **illeszkedik a dashboard + lista/részlet** mintákhoz; **`DashboardLayoutGrid`** ahol illik.
- [ ] URL-ek követik a **`/dashboard/...`** lista és **`[dinamikus]/page.tsx`** részlet konvenciókat.
- [ ] Stílus: **`src/components/ui`** és **szemantikus Tailwind tokenek** (shadcn vonal).

Környezet és API: **[Fejlesztői útmutató](DEV_GUIDE.hu.md)**.
