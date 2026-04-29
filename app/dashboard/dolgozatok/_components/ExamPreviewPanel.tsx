"use client";

import {
  forwardRef,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Circle, Square } from "lucide-react";
import type { ExamQuestionFormSnapshot } from "./examSaveContext";
import { taskTypeLabel } from "./constants";
import { fillInBlankUnderlineWidthCh } from "./fillInBlankUnderline";
import type { CanvasItem } from "./types";
import { cn } from "@/lib/utils";

/** Fixed paper palette — ignores app dark mode so előnézet matches PDF/black-on-white nyomtatás. */
const P = {
  paper: "bg-white text-neutral-950 [color-scheme:light]",
  body: "text-[12pt] leading-[1.45] antialiased font-sans",
  muted: "text-neutral-700",
  label: "text-[11px] font-semibold uppercase tracking-wide text-neutral-600",
  border: "border border-neutral-900",
  subtleBorder: "border border-neutral-400",
} as const;

/**
 * Böngésző „Mentés PDF” nézetben a flex-gap gyakran kiesik → követő testvérre margin-top.
 * Lapozás számítás (A4_PREVIEW_ITEM_GAP_PX ≈ ez a px) maradjon ez a ~20 px.
 */
const EXAM_Q_STACK = "exam-print-q-gap flex flex-col [&>*+*]:mt-5 print:[&>*+*]:mt-5";
function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  return null;
}

/** Matches `gap-5` on the question column (flex spacing between cards). */
const A4_PREVIEW_ITEM_GAP_PX = 20;

/**
 * Ragassza a kérdéskártyák indexeit virtuális lapokra; az első lapon levonjuk a tanulói fejléc + gap magasságát (px).
 */
function splitQuestionIndicesAcrossPages(
  heights: readonly number[],
  pageInnerPx: number,
  headerBlockPx: number,
): number[][] {
  if (heights.length === 0) return [[]];

  const pages: number[][] = [];
  let i = 0;
  let pageIx = 0;

  while (i < heights.length) {
    const page: number[] = [];
    let remaining =
      pageInnerPx -
      (pageIx === 0 ? Math.min(headerBlockPx, Math.max(0, pageInnerPx - 1)) : 0);

    while (i < heights.length) {
      const between = page.length === 0 ? 0 : A4_PREVIEW_ITEM_GAP_PX;
      const h = heights[i]!;
      const delta = between + h;
      if (delta <= remaining || page.length === 0) {
        page.push(i);
        remaining -= delta;
        i++;
      } else {
        break;
      }
    }

    pages.push(page);
    pageIx++;
  }

  return pages;
}

const StudentSheetHeader = forwardRef<HTMLElement, { displayTitle: string; showFieldsRow: boolean }>(
  function StudentSheetHeader({ displayTitle, showFieldsRow }, ref) {
    return (
      <header className="border-b border-neutral-950 pb-4 print:pb-3" ref={ref}>
        <h2 className="text-[14pt] font-bold leading-snug tracking-tight text-neutral-950 print:text-[14pt]">
          {displayTitle}
        </h2>
        <p className="mt-1.5 text-[10pt] text-neutral-600 print:hidden">Így néz ki a dolgozat papíron és PDF-ben.</p>

        <dl
          className={cn(
            "mt-4 flex w-full flex-wrap items-stretch gap-x-5 gap-y-4 text-[11pt] text-neutral-950 sm:flex-nowrap sm:gap-x-6",
            showFieldsRow ? "flex" : "hidden print:flex",
          )}
        >
          <div className="flex min-h-15 min-w-[min(100%,12rem)] flex-[1.6] flex-col justify-end gap-2">
            <dt className="shrink-0 text-[10pt] font-medium leading-tight">Tanuló neve</dt>
            <dd className="min-h-10 border-b-2 border-neutral-900 bg-transparent p-0 print:border-neutral-950">&nbsp;</dd>
          </div>
          <div className="flex min-h-15 min-w-26 flex-1 flex-col justify-end gap-2">
            <dt className="shrink-0 text-[10pt] font-medium leading-tight">Osztály</dt>
            <dd className="min-h-10 border-b-2 border-neutral-900 bg-transparent p-0 print:border-neutral-950">&nbsp;</dd>
          </div>
          <div className="flex min-h-15 min-w-26 flex-1 flex-col justify-end gap-2">
            <dt className="shrink-0 text-[10pt] font-medium leading-tight">Dátum</dt>
            <dd className="min-h-10 border-b-2 border-neutral-900 bg-transparent p-0 print:border-neutral-950">&nbsp;</dd>
          </div>
        </dl>
      </header>
    );
  },
);

/** Stabil keverés papírelőnézet / nyomtatás ugyanazon listán ugyanarra a „feladatlap” elrendezésre. */
function fnv1a32(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffleDeterministic<T>(items: readonly T[], seedStr: string): T[] {
  const a = [...items];
  let s = fnv1a32(seedStr);
  const rnd = (): number => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function PreviewBlock({ children }: { children: ReactNode }) {
  return <div className={cn("mt-3 space-y-2 font-sans leading-relaxed text-[12pt]", P.muted)}>{children}</div>;
}

function parseAnswerLineCount(spec: unknown, mode: "short" | "long"): number {
  const s = asRecord(spec);
  const raw = s?.answerLineCount;
  const fallback = mode === "short" ? 5 : 18;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(80, Math.max(1, Math.round(raw)));
  }
  return fallback;
}

function AnswerWritingLines({ lineCount }: { lineCount: number }) {
  const n = Math.min(80, Math.max(1, Math.round(lineCount)));
  return (
    <div
      className={cn("mt-3 border bg-white", P.subtleBorder, "print:border-neutral-900")}
      aria-label={`Írósorok: ${n} sor`}
    >
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="min-h-9 border-b border-neutral-800/80 last:border-b-0 print:border-neutral-900/85" />
      ))}
    </div>
  );
}

function PreviewQuestionCard({
  index,
  item,
  snapshot,
}: {
  index: number;
  item: CanvasItem;
  snapshot: ExamQuestionFormSnapshot | null;
}) {
  const title = snapshot?.title?.trim() || `Kérdés ${index + 1}`;
  const description = snapshot?.description?.trim();
  const points = snapshot?.maxPoints ?? 5;
  const typeLabel = taskTypeLabel(item.typeId) ?? item.typeId;
  const spec = snapshot?.spec;

  return (
    <div
      className={cn(
        P.paper,
        "break-inside-avoid px-5 py-4 shadow-none",
        P.border,
        "rounded-none sm:rounded-[2px]",
        "print:border-neutral-950 print:bg-white print:shadow-none print:px-7 print:py-6",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={P.label}>{index + 1}. kérdés · {typeLabel}</p>
          <h3 className="mt-1 text-[12pt] font-bold leading-snug tracking-tight text-neutral-950">{title}</h3>
          {description ? (
            <p className={cn("mt-2 text-[12pt] leading-snug font-normal text-neutral-800")}>{description}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center whitespace-nowrap border px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-neutral-900",
            P.border,
          )}
        >
          {points} p
        </span>
      </div>

      {!snapshot ? (
        <p className={cn("mt-3 text-[12pt] text-neutral-600")}>A szerkesztőben töltsd ki ezt a kérdést.</p>
      ) : (
        <PreviewBody typeId={item.typeId} spec={spec} rubric={snapshot.rubric} />
      )}
    </div>
  );
}

function PreviewBody({
  typeId,
  spec,
  rubric,
}: {
  typeId: CanvasItem["typeId"];
  spec: unknown;
  rubric?: string;
}) {
  const s = asRecord(spec);

  switch (typeId) {
    case "radio":
    case "checkbox": {
      const options = Array.isArray(s?.options) ? s.options : [];
      return (
        <PreviewBlock>
          <ul className="space-y-2">
            {options.map((opt, i) => {
              const o = asRecord(opt);
              const label = typeof o?.label === "string" ? o.label : `Lehetőség ${i + 1}`;
              return (
                <li key={i} className={cn("flex items-center gap-2 border bg-white px-3 py-2 text-[12pt]", P.subtleBorder)}>
                  {typeId === "radio" ? (
                    <Circle className="size-4 shrink-0 text-neutral-700" aria-hidden />
                  ) : (
                    <Square className="size-4 shrink-0 text-neutral-700" aria-hidden />
                  )}
                  <span className="text-neutral-950">{label}</span>
                </li>
              );
            })}
          </ul>
        </PreviewBlock>
      );
    }
    case "true_false":
      return (
        <PreviewBlock>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn("flex items-center gap-2 border bg-white px-3 py-2 text-[12pt]", P.subtleBorder)}>
              <Circle className="size-4 text-neutral-700" aria-hidden />
              <span className="text-neutral-950">Igaz</span>
            </div>
            <div className={cn("flex items-center gap-2 border bg-white px-3 py-2 text-[12pt]", P.subtleBorder)}>
              <Circle className="size-4 text-neutral-700" aria-hidden />
              <span className="text-neutral-950">Hamis</span>
            </div>
          </div>
        </PreviewBlock>
      );
    case "short_answer":
      return (
        <PreviewBlock>
          {rubric?.trim() ? (
            <p className="text-[11pt] text-neutral-700 print:hidden">
              <span className="font-semibold text-neutral-950">Tanári megjegyzés (nem kerül rá a dolgozatra): </span>
              {rubric}
            </p>
          ) : null}
          <AnswerWritingLines lineCount={parseAnswerLineCount(spec, "short")} />
        </PreviewBlock>
      );
    case "long_answer":
      return (
        <PreviewBlock>
          {rubric?.trim() ? (
            <p className="mb-2 text-[11pt] text-neutral-800">
              <span className="font-semibold text-neutral-950">Útmutató: </span>
              {rubric}
            </p>
          ) : null}
          <AnswerWritingLines lineCount={parseAnswerLineCount(spec, "long")} />
        </PreviewBlock>
      );
    case "matching": {
      const premises = Array.isArray(s?.premises) ? s.premises : [];
      const responses = Array.isArray(s?.responses) ? s.responses : [];
      return (
        <PreviewBlock>
          <div className="grid min-w-0 grid-cols-2 gap-x-8 gap-y-3">
            <div className="min-w-0">
              <p className={cn(P.label, "mb-2 tracking-normal normal-case print:text-neutral-700")}>Kifejezések</p>
              <ul className="space-y-1.5">
                {premises.map((p, i) => {
                  const pr = asRecord(p);
                  const label = typeof pr?.label === "string" ? pr.label : "—";
                  return (
                    <li key={i} className={cn("border bg-white px-2 py-1.5 text-[12pt] text-neutral-950", P.subtleBorder)}>
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="min-w-0">
              <p className={cn(P.label, "mb-2 tracking-normal normal-case print:text-neutral-700")}>Válaszok</p>
              <ul className="space-y-1.5">
                {responses.map((r, i) => {
                  const rr = asRecord(r);
                  const label = typeof rr?.label === "string" ? rr.label : "—";
                  return (
                    <li key={i} className={cn("border bg-white px-2 py-1.5 text-[12pt] text-neutral-950", P.subtleBorder)}>
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </PreviewBlock>
      );
    }
    case "ordering": {
      const rawItems = Array.isArray(s?.items) ? s.items : [];
      type RowInfo = { label: string; stableId: number };
      const rowsBase: RowInfo[] = rawItems.map((it, i) => {
        const ir = asRecord(it);
        const label = typeof ir?.label === "string" ? ir.label : `Elem ${i + 1}`;
        return { label, stableId: i };
      });
      const seed = rowsBase.map((r) => r.label).join("\u241e");
      const scrambled = rowsBase.length >= 2 ? shuffleDeterministic(rowsBase, `${seed}:${rowsBase.length}`) : rowsBase;

      return (
        <PreviewBlock>
          <p className="mb-1.5 text-[11pt] leading-snug text-neutral-900">
            Írd a bal mezőbe a megfelelő sorszámokat (<span className="font-medium tabular-nums">1</span> = legkorábbi).
            Minden szám pontosan egyszer fordul elő.
          </p>
          <div className="-mx-px overflow-hidden rounded-sm border border-neutral-900 print:border-neutral-950">
            <table className="w-full border-collapse text-[11pt] leading-snug tabular-nums">
              <thead>
                <tr className="bg-neutral-50 text-left text-neutral-900 print:bg-white">
                  <th
                    scope="col"
                    className="w-11 border-b border-neutral-900 px-1 py-1 text-center text-[10pt] font-semibold leading-tight print:border-neutral-950"
                  >
                    Sz.
                  </th>
                  <th
                    scope="col"
                    className="border-b border-l border-neutral-900 px-2 py-1 text-left text-[10pt] font-semibold leading-tight print:border-neutral-950"
                  >
                    Elemek
                  </th>
                </tr>
              </thead>
              <tbody>
                {scrambled.map((row) => (
                  <tr key={row.stableId}>
                    <td className="border-b border-neutral-900 bg-white px-1 py-0.5 align-middle print:border-neutral-950">
                      <span className="mx-auto block min-h-[1.1rem] w-full max-w-8 border-b border-neutral-400 print:border-neutral-800" aria-hidden />
                    </td>
                    <td className="border-b border-l border-neutral-900 px-2 py-0.5 text-neutral-950 print:border-neutral-950">
                      {row.label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-[9pt] text-neutral-500 print:hidden">
            Előnézetben kevert sor — nem ugyanaz, mint a szerkesztőben mentett „helyes” sorrend.
          </p>
        </PreviewBlock>
      );
    }
    case "grouping": {
      const groups = Array.isArray(s?.groups) ? s.groups : [];
      const grpItems = Array.isArray(s?.items) ? s.items : [];
      return (
        <PreviewBlock>
          <p className="text-[11pt] text-neutral-600 print:hidden">Rajzolj bekötővonallal a megfelelő csoportokhoz.</p>
          <div className="mt-4 grid min-w-0 grid-cols-2 gap-x-8 gap-y-6">
            <div className="min-w-0">
              <p className={cn(P.label, "mb-3 uppercase print:text-neutral-700")}>Csoportok</p>
              <ul className="space-y-5">
                {groups.map((g, i) => {
                  const gr = asRecord(g);
                  const label = typeof gr?.label === "string" ? gr.label : "—";
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex min-h-15 items-center border bg-white px-4 py-4 text-[12pt] leading-snug text-neutral-950",
                        P.subtleBorder,
                      )}
                    >
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="min-w-0">
              <p className={cn(P.label, "mb-3 uppercase print:text-neutral-700")}>Elemek</p>
              <ul className="space-y-5">
                {grpItems.map((it, i) => {
                  const ir = asRecord(it);
                  const label = typeof ir?.label === "string" ? ir.label : "—";
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex min-h-15 items-center border bg-white px-4 py-4 text-[12pt] leading-snug text-neutral-950",
                        P.subtleBorder,
                      )}
                    >
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </PreviewBlock>
      );
    }
    case "fill_in_the_blank": {
      const segments = Array.isArray(s?.segments) ? s.segments : [];
      return (
        <PreviewBlock>
          <p className="text-[12pt] leading-[1.45] text-neutral-950">
            {segments.map((seg, i) => {
              const sr = asRecord(seg);
              if (sr?.kind === "blank") {
                const w = fillInBlankUnderlineWidthCh(sr.acceptedAnswers);
                return (
                  <span
                    key={i}
                    className="mx-[0.35em] inline-block box-border min-h-[1.15em] align-baseline border-b-2 border-neutral-950"
                    style={{ width: w, minWidth: w }}
                    title="Kitöltendő hely"
                    aria-hidden
                  >
                    &nbsp;
                  </span>
                );
              }
              const text = typeof sr?.text === "string" ? sr.text : "";
              return (
                <span key={i} className="whitespace-pre-wrap text-neutral-950">
                  {text}
                </span>
              );
            })}
          </p>
        </PreviewBlock>
      );
    }
    default:
      return null;
  }
}

type ExamPreviewPanelProps = {
  examTitle: string;
  items: CanvasItem[];
  getSnapshot: (canvasItemId: string) => ExamQuestionFormSnapshot | null;
  /** Előnézet fül: A4 fizikai méretű lap */
  a4PaperPreview?: boolean;
};

export function ExamPreviewPanel({ examTitle, items, getSnapshot, a4PaperPreview = false }: ExamPreviewPanelProps) {
  const displayTitle = examTitle.trim() || "Névtelen dolgozat";

  /** ResizeObserverhez: ne zárjunk elavult „items” listát akkor sem, ha csak tartalom változásként nő a karton. */
  const itemsRef = useRef(items);

  useLayoutEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const a4RootRef = useRef<HTMLDivElement>(null);
  /** Egy virtuális lap belső (padolt) tartalmának fizikai px magassága — `h-[279mm]` (= 297 mm − 18 mm párnázás). */
  const a4InnerMeasureRef = useRef<HTMLDivElement>(null);
  const sheetHeaderMeasureRef = useRef<HTMLElement | null>(null);
  const questionWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [a4Pages, setA4Pages] = useState<number[][] | null>(null);

  const itemIdsJoined = useMemo(() => items.map((x) => x.id).join("\0"), [items]);

  useLayoutEffect(() => {
    questionWrapRefs.current = new Array(items.length).fill(null);
  }, [itemIdsJoined, items.length]);

  useLayoutEffect(() => {
    if (!a4PaperPreview) {
      setA4Pages(null);
      return;
    }
    if (items.length === 0) return;

    const root = a4RootRef.current;
    const inner = a4InnerMeasureRef.current;
    if (!root || !inner) return;

    let rafId = 0;

    function measureAndSplit() {
      const q = itemsRef.current;
      const ruler = a4InnerMeasureRef.current;
      if (!ruler) return;
      const innerPx = ruler.offsetHeight;
      if (innerPx <= 8) return;

      const hdr = sheetHeaderMeasureRef.current;
      const headerBlockPx = hdr ? hdr.offsetHeight + A4_PREVIEW_ITEM_GAP_PX : A4_PREVIEW_ITEM_GAP_PX;

      const heights = q.map((_, qi) => {
        const wrap = questionWrapRefs.current[qi];
        const h = wrap?.getBoundingClientRect().height ?? 0;
        return Number.isFinite(h) ? Math.max(1e-6, Math.round(h * 1000) / 1000) : 0;
      });

      if (heights.some((h) => h < 0.05)) {
        rafId = requestAnimationFrame(measureAndSplit);
        return;
      }

      setA4Pages(splitQuestionIndicesAcrossPages(heights, innerPx, headerBlockPx));
    }

    function schedule() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureAndSplit);
    }

    measureAndSplit();

    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [a4PaperPreview, itemIdsJoined, items.length]);

  const sheetBase = cn(
    "exam-student-sheet font-sans font-normal tracking-normal print:mx-auto print:max-w-[210mm]",
    P.paper,
    P.body,
  );

  const a4ArticlePageClass = cn(
    "exam-a4-screen-page exam-print-q-gap box-border mb-3 flex min-h-[297mm] min-w-0 flex-col border-b-[12px] border-[#40404a] bg-white px-[12mm] py-[9mm] last:mb-0 last:border-b-0 print:m-0 print:min-h-0 print:border-0 print:px-0 print:py-0",
    "[&>*+*]:mt-5 print:[&>*+*]:mt-5",
  );

  return (
    <>
      {a4PaperPreview ? (
        <p className="mx-auto mb-4 max-w-xl text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400 print:hidden dark:text-neutral-500">
          A4 előnézet · 210 mm · ~297 mm / lap. A blokkok virtuálisan lapfüzetbe tördelődnek (nem háttér-csík). Nyomtatáskor látszik
          URL → böngésző nyomtató → fejléc és lábléc kikapcsolva.
        </p>
      ) : null}

      {!a4PaperPreview ? (
        <div className={cn(sheetBase, "space-y-5 pb-10")}>
          <StudentSheetHeader displayTitle={displayTitle} showFieldsRow={false} />
          {items.length === 0 ? (
            <p
              className={cn(
                "border border-dashed border-neutral-500 bg-transparent px-4 py-8 text-center text-[12pt] text-neutral-600",
              )}
            >
              Még nincs kérdés. A szerkesztőben húzz feladattípust a vászonra.
            </p>
          ) : (
            <div className={EXAM_Q_STACK}>
              {items.map((item, index) => (
                <PreviewQuestionCard key={item.id} index={index} item={item} snapshot={getSnapshot(item.id)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          ref={a4RootRef}
          className={cn(
            sheetBase,
            "exam-a4-screen-root relative mx-auto box-border w-[210mm] max-w-[min(210mm,calc(100vw-2rem))] overflow-hidden rounded-sm border-[0.75px] border-neutral-950/95 text-[12pt] leading-[1.45] shadow-[0_28px_64px_-20px_rgba(0,0,0,0.55)]",
            "print:border-0 print:shadow-none",
          )}
        >
          <div
            className="pointer-events-none absolute left-0 top-0 isolate -z-10 h-[279mm] w-px opacity-0"
            aria-hidden
            ref={a4InnerMeasureRef}
          />

          {items.length === 0 ? (
            <article className={cn(a4ArticlePageClass)}>
              <StudentSheetHeader ref={sheetHeaderMeasureRef} displayTitle={displayTitle} showFieldsRow />
              <p
                className={cn(
                  "border border-dashed border-neutral-500 bg-transparent px-4 py-8 text-center text-[12pt] text-neutral-600",
                )}
              >
                Még nincs kérdés. A szerkesztőben húzz feladattípust a vászonra.
              </p>
            </article>
          ) : a4Pages === null ? (
            <div className={cn("relative exam-print-q-gap px-[12mm] py-[9mm]", "[&>*+*]:mt-5 print:[&>*+*]:mt-5")}>
              <StudentSheetHeader ref={sheetHeaderMeasureRef} displayTitle={displayTitle} showFieldsRow />
              <div className={EXAM_Q_STACK}>
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    ref={(el) => {
                      questionWrapRefs.current[index] = el;
                    }}
                  >
                    <PreviewQuestionCard index={index} item={item} snapshot={getSnapshot(item.id)} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {a4Pages.map((indices, pi) => (
                <article key={`a4-${pi}-${indices.join(",")}`} className={cn(a4ArticlePageClass)}>
                  {pi === 0 ? (
                    <StudentSheetHeader ref={sheetHeaderMeasureRef} displayTitle={displayTitle} showFieldsRow />
                  ) : null}
                  <div className={EXAM_Q_STACK}>
                    {indices.map((qIdx) => {
                      const item = items[qIdx]!;
                      return (
                        <div
                          key={item.id}
                          ref={(el) => {
                            questionWrapRefs.current[qIdx] = el;
                          }}
                        >
                          <PreviewQuestionCard
                            index={qIdx}
                            item={item}
                            snapshot={getSnapshot(item.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}
