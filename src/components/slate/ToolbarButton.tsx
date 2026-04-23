import { ReactNode } from "react";

export const ToolbarButton = ({
  icon,
  onClick,
  isActive,
  title,
}: {
  icon: ReactNode;
  onClick: () => void;
  isActive: boolean;
  title?: string;
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    className={`size-10 cursor-pointer flex items-center justify-center transition-colors ${
      isActive
        ? "bg-primary text-foreground shadow-sm"
        : "text-foreground/60 hover:bg-foreground/20 hover:text-foreground"
    }`}
    onMouseDown={(event) => {
      // Keep Slate selection while applying toolbar actions.
      event.preventDefault();
      onClick();
    }}
  >
    {icon}
  </button>
);
