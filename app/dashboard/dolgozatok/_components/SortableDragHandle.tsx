"use client";

type SortableDragHandleProps = {
   handleRef: (element: HTMLElement | null) => void;
};

export function SortableDragHandle({ handleRef }: SortableDragHandleProps) {
   return (
      <div ref={handleRef} className="absolute top-0 right-0 w-8 h-8 cursor-grab flex items-center justify-center" title="Drag to reorder">
         <div className="grid grid-cols-2 gap-0.5">
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
         </div>
      </div>
   );
}
