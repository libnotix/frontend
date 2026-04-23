import { useEffect, useState } from "react";
import { Range } from "slate";
import { useSlate } from "slate-react";

export function usePersistentSelection() {
  const editor = useSlate();
  const [selection, setSelection] = useState<Range | null>(editor.selection);

  useEffect(() => {
    if (editor.selection) {
      setSelection(editor.selection);
    }
  }, [editor.selection]);

  return selection;
}
