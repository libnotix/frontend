"use client";

import { memo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { DynamicIslandSlot } from "@/components/dashboard/DynamicIslandSlot";
import { cn } from "@/lib/utils";

export type ExamLeftViewMode = "editor" | "preview";

type ExamDynamicIslandProps = {
  title: string;
  onTitleChange: (title: string) => void;
  leftViewMode: ExamLeftViewMode;
  onLeftViewModeChange: (mode: ExamLeftViewMode) => void;
  titleError?: string;
  invalidQuestionCount: number;
  isSaving: boolean;
  isSaveError: boolean;
  lastSaved: Date | null;
  saveStatusMessage: string | null;
  canSave: boolean;
  onSave: () => void;
  onDelete?: () => void;
};

const buttonSpring = {
  type: "spring" as const,
  stiffness: 700,
  damping: 14,
  mass: 0.4,
};

const iconSwap = {
  type: "spring" as const,
  stiffness: 680,
  damping: 16,
  mass: 0.5,
};

function LeftIsland({
  title,
  onTitleChange,
  titleError,
  invalidQuestionCount,
  onBack,
}: {
  title: string;
  onTitleChange: (title: string) => void;
  titleError?: string;
  invalidQuestionCount: number;
  onBack: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasIssues = Boolean(titleError) || invalidQuestionCount > 0;
  const issueLabel = titleError ?? `${invalidQuestionCount} hibás kérdés`;
  const showTitle = expanded || editing;

  return (
    <DynamicIslandSlot slot="left">
      <div
        className="flex items-center gap-0.5 px-1.5 py-1"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          if (!editing) setExpanded(false);
        }}
      >
        <motion.button
          type="button"
          onClick={onBack}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          transition={buttonSpring}
          aria-label="Vissza"
        >
          <ArrowLeft className="size-3.5" />
        </motion.button>

        <motion.button
          type="button"
          className={`flex size-7 shrink-0 cursor-default items-center justify-center rounded-full transition-colors ${
            hasIssues ? "text-destructive" : "text-emerald-400"
          } ${expanded ? "bg-white/10" : ""}`}
          whileHover={{ scale: 1.1 }}
          transition={buttonSpring}
          aria-label={hasIssues ? issueLabel : "Minden rendben"}
          title={hasIssues ? issueLabel : "Minden rendben"}
        >
          {hasIssues ? <AlertCircle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
        </motion.button>

        {showTitle ? (
          editing ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              onBlur={() => {
                setEditing(false);
                setExpanded(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.currentTarget.blur();
                }
              }}
              className="w-[180px] border-none bg-transparent pl-0.5 pr-1.5 text-[13px] font-medium text-inherit outline-none placeholder:text-white/30"
              placeholder="Névtelen dolgozat"
            />
          ) : (
            <span
              onClick={() => {
                setEditing(true);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="max-w-[180px] cursor-text truncate whitespace-nowrap pl-0.5 pr-1.5 text-[13px] font-medium transition-colors hover:text-white/90"
            >
              {title || "Névtelen dolgozat"}
            </span>
          )
        ) : null}

        {expanded && hasIssues ? (
          <span className="whitespace-nowrap pl-1 pr-1.5 text-[11px] font-medium text-destructive">
            {issueLabel}
          </span>
        ) : null}
      </div>
    </DynamicIslandSlot>
  );
}

function CenterIsland({
  mode,
  onModeChange,
}: {
  mode: ExamLeftViewMode;
  onModeChange: (mode: ExamLeftViewMode) => void;
}) {
  return (
    <DynamicIslandSlot slot="center">
      <div className="flex items-center gap-0.5 rounded-full bg-white/10 p-0.5">
        <button
          type="button"
          onClick={() => onModeChange("editor")}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
            mode === "editor" ? "bg-white/20 text-white shadow-sm" : "text-white/65 hover:text-white/90",
          )}
        >
          Szerkesztő
        </button>
        <button
          type="button"
          onClick={() => onModeChange("preview")}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
            mode === "preview" ? "bg-white/20 text-white shadow-sm" : "text-white/65 hover:text-white/90",
          )}
        >
          Előnézet
        </button>
      </div>
    </DynamicIslandSlot>
  );
}

function RightIsland({
  isSaving,
  isSaveError,
  lastSaved,
  saveStatusMessage,
  canSave,
  onSave,
  onDelete,
}: {
  isSaving: boolean;
  isSaveError: boolean;
  lastSaved: Date | null;
  saveStatusMessage: string | null;
  canSave: boolean;
  onSave: () => void;
  onDelete?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lastSavedText = lastSaved
    ? `Mentve ${lastSaved.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`
    : null;
  const label = isSaving
    ? "Mentés..."
    : isSaveError
      ? "Hiba a mentésnél!"
      : saveStatusMessage ?? lastSavedText ?? "Nincs mentve";

  return (
    <DynamicIslandSlot slot="right">
      <div
        className="flex items-center gap-0.5 px-1.5 py-1"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="sr-only" aria-live="polite">
          {label}
        </span>
        {hovered ? (
          <span
            className={`whitespace-nowrap pl-1.5 pr-0.5 text-[11px] font-medium ${
              isSaveError ? "text-destructive" : isSaving ? "text-white/60" : "text-white/50"
            }`}
          >
            {label}
          </span>
        ) : null}

        {onDelete ? (
          <motion.button
            type="button"
            onClick={onDelete}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/15"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            transition={buttonSpring}
            aria-label="Dolgozat törlése"
          >
            <Trash2 className="size-3.5" />
          </motion.button>
        ) : null}

        <motion.button
          type="button"
          onClick={onSave}
          disabled={!canSave || isSaving}
          className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={{ scale: canSave && !isSaving ? 1.2 : 1 }}
          whileTap={{ scale: canSave && !isSaving ? 0.8 : 1 }}
          transition={buttonSpring}
          aria-label="Mentés"
        >
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="spin"
                initial={{ opacity: 0, scale: 0.3, rotate: -120 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.3, rotate: 120 }}
                transition={iconSwap}
              >
                <Loader2 className="text-primary size-3.5 animate-spin" />
              </motion.div>
            ) : isSaveError ? (
              <motion.div key="err" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.3 }} transition={iconSwap}>
                <AlertCircle className="size-3.5 text-destructive" />
              </motion.div>
            ) : hovered ? (
              <motion.div key="save-hover" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.3 }} transition={iconSwap}>
                <Save className="size-3.5" />
              </motion.div>
            ) : lastSaved ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.3 }} transition={iconSwap}>
                <CheckCircle2 className="size-3.5 text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.3 }} transition={iconSwap}>
                <Save className="size-3.5" />
              </motion.div>
            )}
          </AnimatePresence>

          {isSaving ? (
            <motion.span
              className="border-primary/40 absolute inset-0 rounded-full border-2"
              initial={{ scale: 0.7, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
        </motion.button>
      </div>
    </DynamicIslandSlot>
  );
}

const ExamDynamicIsland = ({
  title,
  onTitleChange,
  leftViewMode,
  onLeftViewModeChange,
  titleError,
  invalidQuestionCount,
  isSaving,
  isSaveError,
  lastSaved,
  saveStatusMessage,
  canSave,
  onSave,
  onDelete,
}: ExamDynamicIslandProps) => {
  const router = useRouter();

  return (
    <>
      <LeftIsland
        title={title}
        onTitleChange={onTitleChange}
        titleError={titleError}
        invalidQuestionCount={invalidQuestionCount}
        onBack={() => router.push("/dashboard/dolgozatok")}
      />

      <CenterIsland mode={leftViewMode} onModeChange={onLeftViewModeChange} />

      <RightIsland
        isSaving={isSaving}
        isSaveError={isSaveError}
        lastSaved={lastSaved}
        saveStatusMessage={saveStatusMessage}
        canSave={canSave}
        onSave={onSave}
        onDelete={onDelete}
      />
    </>
  );
};

export default memo(ExamDynamicIsland);
