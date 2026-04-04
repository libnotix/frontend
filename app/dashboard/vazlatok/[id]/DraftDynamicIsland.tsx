"use client";

import { memo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DynamicIslandSlot } from "@/components/dashboard/DynamicIslandSlot";

type DraftDynamicIslandProps = {
  title: string;
  onTitleChange: (title: string) => void;
  isSaving: boolean;
  isSaveError: boolean;
  lastSaved: Date | null;
  onSave: () => void;
  onDetailsOpen?: () => void;
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
  onBack,
  onDetailsOpen,
}: {
  title: string;
  onTitleChange: (title: string) => void;
  onBack: () => void;
  onDetailsOpen?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = () => {
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleBlur = () => {
    setEditing(false);
    setExpanded(false);
  };

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
          onClick={onBack}
          className="flex items-center justify-center size-7 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          transition={buttonSpring}
          aria-label="Vissza"
        >
          <ArrowLeft className="size-3.5" />
        </motion.button>

        {onDetailsOpen && (
          <motion.button
            onClick={onDetailsOpen}
            className="flex items-center justify-center size-7 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            transition={buttonSpring}
            aria-label="Részletek"
          >
            <Info className="size-3.5" />
          </motion.button>
        )}

        {showTitle && (
          editing ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.currentTarget.blur();
                }
              }}
              className="text-[13px] font-medium bg-transparent outline-none border-none text-inherit placeholder:text-white/30 w-[180px] pl-0.5 pr-1.5"
              placeholder="Névtelen vázlat"
            />
          ) : (
            <span
              onClick={handleTitleClick}
              className="text-[13px] font-medium truncate max-w-[180px] whitespace-nowrap pl-0.5 pr-1.5 cursor-text hover:text-white/90 transition-colors"
            >
              {title || "Névtelen vázlat"}
            </span>
          )
        )}
      </div>
    </DynamicIslandSlot>
  );
}

function RightIsland({
  isSaving,
  isSaveError,
  lastSaved,
  onSave,
}: {
  isSaving: boolean;
  isSaveError: boolean;
  lastSaved: Date | null;
  onSave: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const lastSavedText = lastSaved
    ? `Mentve ${lastSaved.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`
    : null;

  return (
    <DynamicIslandSlot slot="right">
      <div
        className="flex items-center gap-0.5 px-1.5 py-1"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <span
            className={`text-[11px] font-medium whitespace-nowrap pl-1.5 pr-0.5 ${
              isSaveError
                ? "text-red-400"
                : isSaving
                  ? "text-white/60"
                  : "text-white/50"
            }`}
          >
            {isSaving
              ? "Mentés..."
              : isSaveError
                ? "Hiba a mentésnél!"
                : lastSavedText ?? "Nincs mentve"}
          </span>
        )}

        <motion.button
          onClick={onSave}
          className="relative flex items-center justify-center size-7 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
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
                <Loader2 className="size-3.5 animate-spin text-primary" />
              </motion.div>
            ) : isSaveError ? (
              <motion.div
                key="err"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={iconSwap}
              >
                <AlertCircle className="size-3.5 text-red-400" />
              </motion.div>
            ) : hovered ? (
              <motion.div
                key="save-hover"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={iconSwap}
              >
                <Save className="size-3.5" />
              </motion.div>
            ) : lastSaved ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={iconSwap}
              >
                <CheckCircle2 className="size-3.5 text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={iconSwap}
              >
                <Save className="size-3.5" />
              </motion.div>
            )}
          </AnimatePresence>

          {isSaving && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              initial={{ scale: 0.7, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.button>
      </div>
    </DynamicIslandSlot>
  );
}

const DraftDynamicIsland = ({
  title,
  onTitleChange,
  isSaving,
  isSaveError,
  lastSaved,
  onSave,
  onDetailsOpen,
}: DraftDynamicIslandProps) => {
  const router = useRouter();

  return (
    <>
      <LeftIsland
        title={title}
        onTitleChange={onTitleChange}
        onBack={() => router.push("/dashboard/vazlatok")}
        onDetailsOpen={onDetailsOpen}
      />

      <RightIsland
        isSaving={isSaving}
        isSaveError={isSaveError}
        lastSaved={lastSaved}
        onSave={onSave}
      />
    </>
  );
};

export default memo(DraftDynamicIsland);
