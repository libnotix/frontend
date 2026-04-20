/**
 * Parses inline markdown (**bold**, *italic*, ***bold+italic***, ~~strikethrough~~)
 * and a small subset of HTML tags (<u>, <b>, <strong>, <i>, <em>, <s>, …)
 * into flat text leaves with marks. Used when AI returns markdown/HTML inside content.
 * Keep in sync with backend/src/draftChats/parseInlineRichText.ts
 */

export type InlineTextLeaf = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

function mergeMarks(
  ...parts: Array<Partial<InlineTextLeaf> | undefined>
): InlineTextLeaf {
  return Object.assign({}, ...parts.filter(Boolean)) as InlineTextLeaf;
}

/**
 * Parses markdown inline formatting: ***bold+italic***, **bold**, *italic*, ~~strikethrough~~.
 * Handles nested and combined markers correctly.
 */
function parseMarkdownInline(text: string): InlineTextLeaf[] {
  if (!text) return [{ text: "" }];

  const result: InlineTextLeaf[] = [];
  // Matches: ***text***, **text**, *text*, ~~text~~
  // Order matters: longest delimiter first to avoid partial matches
  const re = /(\*{3})((?:(?!\1).)+?)\1|(\*{2})((?:(?!\3).)+?)\3|(\*)((?:(?!\5).)+?)\5|(~~)((?:(?!\7).)+?)\7/g;

  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      result.push({ text: text.slice(lastIndex, m.index) });
    }

    if (m[1] === "***" && m[2]) {
      // ***bold+italic***
      for (const leaf of parseMarkdownInline(m[2])) {
        result.push({ ...leaf, bold: true, italic: true });
      }
    } else if (m[3] === "**" && m[4]) {
      // **bold**
      for (const leaf of parseMarkdownInline(m[4])) {
        result.push({ ...leaf, bold: true });
      }
    } else if (m[5] === "*" && m[6]) {
      // *italic*
      for (const leaf of parseMarkdownInline(m[6])) {
        result.push({ ...leaf, italic: true });
      }
    } else if (m[7] === "~~" && m[8]) {
      // ~~strikethrough~~
      for (const leaf of parseMarkdownInline(m[8])) {
        result.push({ ...leaf, strikethrough: true });
      }
    }

    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex) });
  }

  return result.length > 0 ? result : [{ text: "" }];
}

function mergeAdjacent(leaves: InlineTextLeaf[]): InlineTextLeaf[] {
  const out: InlineTextLeaf[] = [];
  for (const leaf of leaves) {
    if (!leaf.text) continue;
    const prev = out[out.length - 1];
    if (
      prev &&
      !!prev.bold === !!leaf.bold &&
      !!prev.italic === !!leaf.italic &&
      !!prev.underline === !!leaf.underline &&
      !!prev.strikethrough === !!leaf.strikethrough
    ) {
      prev.text += leaf.text;
    } else {
      out.push({ ...leaf });
    }
  }
  return out.length > 0 ? out : [{ text: "" }];
}

const SUPPORTED = new Set(["u", "b", "strong", "i", "em", "s", "strike", "del"]);

function tagCanonical(name: string): string {
  const n = name.toLowerCase();
  if (n === "strong") return "b";
  if (n === "em") return "i";
  if (n === "strike" || n === "del") return "s";
  return n;
}

function marksFromStack(stack: string[]): Partial<InlineTextLeaf> {
  const m: Partial<InlineTextLeaf> = {};
  for (const t of stack) {
    if (t === "u") m.underline = true;
    if (t === "b") m.bold = true;
    if (t === "i") m.italic = true;
    if (t === "s") m.strikethrough = true;
  }
  return m;
}

/**
 * Parses inline markdown (**bold**, *italic*, ***bold+italic***, ~~strikethrough~~)
 * plus HTML: <u>, <b>, <strong>, <i>, <em>, <s>, <strike>, <del> (case-insensitive).
 * Unknown tags are left as literal text.
 */
export function parseInlineRichText(input: string): InlineTextLeaf[] {
  const normalized = input.replace(/\r\n/g, "\n");
  if (!normalized) return [{ text: "" }];

  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\s*>/g;
  const stack: string[] = [];
  let pos = 0;
  const chunks: Array<{ text: string; stack: string[] }> = [];
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(normalized)) !== null) {
    const before = normalized.slice(pos, m.index);
    if (before.length > 0) {
      chunks.push({ text: before, stack: [...stack] });
    }
    const isClose = m[1] === "/";
    const rawName = m[2] ?? "";
    const name = rawName.toLowerCase();
    pos = m.index + m[0].length;

    if (!SUPPORTED.has(name)) {
      chunks.push({ text: m[0], stack: [...stack] });
      continue;
    }

    const canon = tagCanonical(name);
    if (isClose) {
      const idx = stack.lastIndexOf(canon);
      if (idx >= 0) {
        stack.splice(idx, 1);
      } else {
        chunks.push({ text: m[0], stack: [...stack] });
      }
    } else {
      stack.push(canon);
    }
  }

  const tail = normalized.slice(pos);
  if (tail.length > 0) {
    chunks.push({ text: tail, stack: [...stack] });
  }

  if (chunks.length === 0) {
    return [{ text: "" }];
  }

  const out: InlineTextLeaf[] = [];
  for (const ch of chunks) {
    const base = marksFromStack(ch.stack);
    for (const bp of parseMarkdownInline(ch.text)) {
      out.push(mergeMarks(base, bp));
    }
  }

  return mergeAdjacent(out);
}
