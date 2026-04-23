import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { useNavbarStore, IslandSlot } from "@/store/navbarStore";
import { motion } from "framer-motion";

const islandSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 22,
  mass: 1,
};


export function AnimatedIsland({
  children,
  isDesktop,
  slot,
}: {
  children?: ReactNode;
  isDesktop: boolean;
  slot?: IslandSlot;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const setDesktopContainer = useNavbarStore(
    (state) => state.setDesktopContainer,
  );
  const setMobileContainer = useNavbarStore(
    (state) => state.setMobileContainer,
  );
  const setDesktopSlot = useNavbarStore((state) => state.setDesktopSlot);
  const setMobileSlot = useNavbarStore((state) => state.setMobileSlot);

  useEffect(() => {
    if (slot) {
      if (isDesktop) {
        setDesktopSlot(slot, contentRef.current);
      } else {
        setMobileSlot(slot, contentRef.current);
      }
    } else {
      if (isDesktop) {
        setDesktopContainer(contentRef.current);
      } else {
        setMobileContainer(contentRef.current);
      }
    }
  }, [isDesktop, slot, setDesktopContainer, setMobileContainer, setDesktopSlot, setMobileSlot]);

  const measure = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = contentRef.current;
      if (!el) return;
      const hasKids = el.childNodes.length > 0 && el.innerHTML.trim() !== "";
      if (!hasKids) {
        setDims(null);
      } else {
        setDims({ w: el.scrollWidth, h: el.scrollHeight });
      }
    });
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true, characterData: true });

    measure();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mo.disconnect();
    };
  }, [measure]);

  const hasContent = dims !== null;

  return (
    <motion.div
      className={`
        flex items-center justify-center rounded-full bg-input border-2 border-white/10 shadow-xl overflow-hidden
        ${isDesktop ? "hidden md:flex" : "flex md:hidden"}
      `}
      animate={{
        width: hasContent ? dims.w : 0,
        height: hasContent ? dims.h : 0,
        opacity: hasContent ? 1 : 0,
      }}
      transition={islandSpring}
    >
      <motion.div
        className="flex items-center justify-center w-max h-max"
        animate={{
          opacity: hasContent ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          ref={contentRef}
          className="empty:hidden flex items-center justify-center"
        />
      </motion.div>
    </motion.div>
  );
}
