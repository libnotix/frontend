import { useEffect, useRef, useState, ReactNode } from "react";
import { useNavbarStore } from "@/store/navbarStore";
import { motion } from "framer-motion";

export function AnimatedIsland({
  children,
  isDesktop,
}: {
  children?: ReactNode;
  isDesktop: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  const setDesktopContainer = useNavbarStore(
    (state) => state.setDesktopContainer,
  );
  const setMobileContainer = useNavbarStore(
    (state) => state.setMobileContainer,
  );

  useEffect(() => {
    if (isDesktop) {
      setDesktopContainer(contentRef.current);
    } else {
      setMobileContainer(contentRef.current);
    }
  }, [isDesktop, setDesktopContainer, setMobileContainer]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const hasContent = el.childNodes.length > 0 && el.innerHTML.trim() !== "";
      if (!hasContent) {
        setSize(null);
      } else {
        setSize({ width: el.scrollWidth, height: el.scrollHeight });
      }
    };

    // Use ResizeObserver to watch the inner content size changes
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(el);

    // Use MutationObserver because React Portals inject children,
    // which might not immediately trigger a resize if it's display: none or absolute etc.
    const mutationObserver = new MutationObserver(() => measure());
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Initial check
    measure();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const hasContent = size !== null;

  // We set explicit absolute dimensions if we have content,
  // or shrink down to an 8x8 dot if we don't.
  // The content itself is measured as unconstrained (absolute invisible or just fit-content).

  return (
    <motion.div
      ref={containerRef}
      className={`
        flex items-center justify-center bg-foreground border border-border shadow-sm overflow-hidden
        ${isDesktop ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "fixed bottom-4 left-1/2 -translate-x-1/2 z-50"}
        ${isDesktop ? "hidden md:flex" : "flex md:hidden"}
      `}
      animate={{
        width: hasContent ? size.width : 8,
        height: hasContent ? size.height : 8,
        borderRadius: hasContent ? 24 : 4,
      }}
      transition={{
        type: "spring",
        bounce: 0.4,
        duration: 0.6,
      }}
    >
      <motion.div
        className="flex items-center justify-center w-max h-max"
        animate={{
          opacity: hasContent ? 1 : 0,
          scale: hasContent ? 1 : 0.8,
          filter: hasContent ? "blur(0px)" : "blur(5px)",
        }}
        transition={{
          type: "spring",
          bounce: 0.4,
          duration: 0.8,
        }}
      >
        {/* We place the portal content here. Measuring scrollWidth/scrollHeight 
            avoids the feedback loop from the parent's scale transform. */}
        <div
          ref={contentRef}
          className="empty:hidden flex items-center justify-center"
        />
      </motion.div>
    </motion.div>
  );
}
