"use client";

import { memo, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  PanelRightOpen,
  PanelRightClose,
  Minus,
  X,
} from "lucide-react";

type ChatMode = "floating" | "docked" | "minimized";

type FloatingChatToggleProps = {
  chatContent: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
};

const bounceTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 22,
  mass: 0.8,
};

const bouncierTransition = {
  type: "spring" as const,
  stiffness: 600,
  damping: 18,
  mass: 0.5,
};

function HeaderButton({
  onClick,
  label,
  destructive,
  children,
}: {
  onClick: () => void;
  label: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      transition={bouncierTransition}
      className={`flex items-center justify-center size-6 rounded-full transition-colors cursor-pointer ${
        destructive
          ? "hover:bg-red-500/15 hover:text-red-400"
          : "hover:bg-white/10"
      }`}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}

function ChatHeader({
  mode,
  onToggleMode,
  onMinimize,
  onClose,
}: {
  mode: "floating" | "docked";
  onToggleMode: () => void;
  onMinimize: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 shrink-0 select-none">
      <div className="flex items-center gap-1.5">
        <MessageSquareText className="size-3.5 text-primary" />
        <span className="text-[13px] font-semibold">AI Asszisztens</span>
      </div>

      <div className="flex items-center gap-1">
        <HeaderButton onClick={onToggleMode} label={mode === "floating" ? "Oldalra dokkolás" : "Lebegő mód"}>
          {mode === "floating" ? (
            <PanelRightOpen className="size-3" />
          ) : (
            <PanelRightClose className="size-3" />
          )}
        </HeaderButton>
        <HeaderButton onClick={onMinimize} label="Minimalizálás">
          <Minus className="size-3" />
        </HeaderButton>
        <HeaderButton onClick={onClose} label="Bezárás" destructive>
          <X className="size-3" />
        </HeaderButton>
      </div>
    </div>
  );
}

type ResizeDir = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const resizeLayout: Record<ResizeDir, { pos: string; cursor: string }> = {
  top:          { pos: "top-0 left-0 right-0 h-1.5",        cursor: "cursor-ns-resize" },
  bottom:       { pos: "bottom-0 left-0 right-0 h-1.5",     cursor: "cursor-ns-resize" },
  left:         { pos: "top-0 left-0 bottom-0 w-1.5",       cursor: "cursor-ew-resize" },
  right:        { pos: "top-0 right-0 bottom-0 w-1.5",      cursor: "cursor-ew-resize" },
  "top-left":   { pos: "top-0 left-0 size-3",               cursor: "cursor-nwse-resize" },
  "top-right":  { pos: "top-0 right-0 size-3",              cursor: "cursor-nesw-resize" },
  "bottom-left":{ pos: "bottom-0 left-0 size-3",            cursor: "cursor-nesw-resize" },
  "bottom-right":{ pos: "bottom-0 right-0 size-3",          cursor: "cursor-nwse-resize" },
};

function ResizeHandle({
  onResize,
  direction,
}: {
  onResize: (deltaW: number, deltaH: number) => void;
  direction: ResizeDir;
}) {
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      const hasLeft = direction.includes("left");
      const hasRight = direction === "right" || direction === "top-right" || direction === "bottom-right";
      const hasTop = direction.includes("top");
      const hasBottom = direction === "bottom" || direction === "bottom-left" || direction === "bottom-right";

      const dw = hasLeft ? -dx : hasRight ? dx : 0;
      const dh = hasTop ? -dy : hasBottom ? dy : 0;
      onResize(dw, dh);
    },
    [onResize, direction],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const { pos, cursor } = resizeLayout[direction];

  return (
    <div
      className={`absolute z-10 ${pos} ${cursor}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}

const FloatingChatToggle = ({
  chatContent,
  isOpen,
  onOpenChange,
  mode,
  onModeChange,
}: FloatingChatToggleProps) => {
  const [floatingSize, setFloatingSize] = useState({ w: 400, h: 520 });

  const toggleMode = useCallback(() => {
    onModeChange(mode === "floating" ? "docked" : "floating");
  }, [mode, onModeChange]);

  const minimize = useCallback(() => {
    onModeChange("minimized");
  }, [onModeChange]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const restore = useCallback(() => {
    onModeChange("floating");
    onOpenChange(true);
  }, [onModeChange, onOpenChange]);

  const handleFloatingResize = useCallback(
    (dw: number, dh: number) => {
      setFloatingSize((prev) => ({
        w: Math.max(320, Math.min(600, prev.w + dw)),
        h: Math.max(300, Math.min(800, prev.h + dh)),
      }));
    },
    [],
  );

  if (!isOpen || mode === "minimized") {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={bouncierTransition}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={restore}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer"
      >
        <MessageSquareText className="size-6" />
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/30"
          initial={{ scale: 1 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.button>
    );
  }

  if (mode === "docked") {
    return (
      <motion.div
        key="docked"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={bounceTransition}
        className="flex flex-col h-full w-full overflow-hidden bg-background"
      >
        <ChatHeader
          mode="docked"
          onToggleMode={toggleMode}
          onMinimize={minimize}
          onClose={close}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          {chatContent}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="floating"
      drag
      dragElastic={0.15}
      dragMomentum={false}
      initial={{ scale: 0.8, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 40 }}
      transition={bounceTransition}
      className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto"
      style={{ width: floatingSize.w }}
    >
      <div className="relative flex flex-col rounded-2xl bg-background shadow-2xl overflow-hidden border border-border/40">
        <ResizeHandle onResize={handleFloatingResize} direction="top" />
        <ResizeHandle onResize={handleFloatingResize} direction="bottom" />
        <ResizeHandle onResize={handleFloatingResize} direction="left" />
        <ResizeHandle onResize={handleFloatingResize} direction="right" />
        <ResizeHandle onResize={handleFloatingResize} direction="top-left" />
        <ResizeHandle onResize={handleFloatingResize} direction="top-right" />
        <ResizeHandle onResize={handleFloatingResize} direction="bottom-left" />
        <ResizeHandle onResize={handleFloatingResize} direction="bottom-right" />

        <ChatHeader
          mode="floating"
          onToggleMode={toggleMode}
          onMinimize={minimize}
          onClose={close}
        />
        <div className="overflow-hidden" style={{ height: floatingSize.h }}>
          {chatContent}
        </div>
      </div>
    </motion.div>
  );
};

export default memo(FloatingChatToggle);
export type { ChatMode };
