"use client";

import React, { memo, ReactNode, useEffect, useRef, useState } from "react";
import { createEditor, Editor, Element, Node, Transforms } from "slate";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from "slate-react";
import { api } from "@/lib/api";
import { Send } from "lucide-react";
import { DynamicIsland } from "@/components/dashboard/DynamicIsland";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

export type SlateEditorNode = {
  type:
    | "paragraph"
    | "heading-one"
    | "heading-two"
    | "heading-three"
    | "heading-four"
    | "heading-five"
    | "heading-six";
  children: FormattedText[];
};

export type MarkType = keyof Omit<FormattedText, "text">;

declare module "slate" {
  interface CustomTypes {
    Element: SlateEditorNode;
    Text: FormattedText;
  }
}

type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

// ---------------------------------------------------------------------------
// Slate helpers
// ---------------------------------------------------------------------------

export const ALL_BLOCK_TYPES: SlateEditorNode["type"][] = [
  "paragraph",
  "heading-one",
  "heading-two",
  "heading-three",
  "heading-four",
  "heading-five",
  "heading-six",
];

export const ALL_MARK_TYPES: MarkType[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
];

export function renderElement({
  attributes,
  children,
  element,
}: RenderElementProps) {
  switch (element.type) {
    case "paragraph":
      return (
        <p {...attributes} className="text-base leading-7 text-foreground my-1">
          {children}
        </p>
      );
    case "heading-one":
      return (
        <h1
          {...attributes}
          className="text-4xl font-extrabold tracking-tight leading-tight text-foreground mt-8 mb-3"
        >
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2
          {...attributes}
          className="text-3xl font-bold tracking-tight leading-snug text-foreground mt-7 mb-2"
        >
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3
          {...attributes}
          className="text-2xl font-semibold leading-snug text-foreground mt-6 mb-2"
        >
          {children}
        </h3>
      );
    case "heading-four":
      return (
        <h4
          {...attributes}
          className="text-xl font-semibold leading-snug text-foreground mt-5 mb-1"
        >
          {children}
        </h4>
      );
    case "heading-five":
      return (
        <h5
          {...attributes}
          className="text-lg font-medium leading-normal text-foreground mt-4 mb-1"
        >
          {children}
        </h5>
      );
    case "heading-six":
      return (
        <h6
          {...attributes}
          className="text-base font-medium leading-normal text-muted-foreground mt-4 mb-1"
        >
          {children}
        </h6>
      );
    default:
      return (
        <p {...attributes} className="text-base leading-7 text-foreground my-1">
          {children}
        </p>
      );
  }
}

// ---------------------------------------------------------------------------
// Mark helpers
// ---------------------------------------------------------------------------

export function isMarkActive(
  editor: ReturnType<typeof useSlate>,
  mark: MarkType,
) {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
}

export function toggleMark(
  editor: ReturnType<typeof useSlate>,
  mark: MarkType,
) {
  if (isMarkActive(editor, mark)) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
}

export function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  let el = <>{children}</>;
  if ((leaf as FormattedText).bold) el = <strong>{el}</strong>;
  if ((leaf as FormattedText).italic) el = <em>{el}</em>;
  if ((leaf as FormattedText).underline) el = <u>{el}</u>;
  if ((leaf as FormattedText).strikethrough) el = <s>{el}</s>;
  return <span {...attributes}>{el}</span>;
}

// ---------------------------------------------------------------------------
// ToolbarButton
// ---------------------------------------------------------------------------

const ToolbarButton = ({
  icon,
  onClick,
  isActive,
}: {
  icon: ReactNode;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    className={`size-9 cursor-pointer flex items-center justify-center rounded-md transition-colors ${
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-background/80 hover:bg-background/20 hover:text-background"
    }`}
    onClick={onClick}
  >
    {icon}
  </button>
);

// ---------------------------------------------------------------------------
// Toolbar — must be inside <Slate>
// ---------------------------------------------------------------------------

const Toolbar = () => {
  const editor = useSlate();
  const { selection } = editor;

  const matchedNodes = selection
    ? Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) => !Editor.isEditor(n) && Element.isElement(n),
        }),
      ).map(([node]) => node)
    : [];

  const activeBlockTypes = Object.fromEntries(
    ALL_BLOCK_TYPES.map((t) => [
      t,
      matchedNodes.length > 0 &&
        matchedNodes.every((n) => Element.isElement(n) && n.type === t),
    ]),
  ) as Record<SlateEditorNode["type"], boolean>;

  const toggleHeading = (type: SlateEditorNode["type"]) => {
    editor.setNodes({ type });
  };

  const MARK_ICONS: Record<MarkType, React.ReactNode> = {
    bold: <strong>B</strong>,
    italic: <em>I</em>,
    underline: <u>U</u>,
    strikethrough: <s>S</s>,
  };

  return (
    <DynamicIsland>
      <div className="flex gap-1 font-bold overflow-hidden rounded-[inherit]">
        {(
          [
            ["paragraph", "P"],
            ["heading-one", "H1"],
            ["heading-two", "H2"],
            ["heading-three", "H3"],
            ["heading-four", "H4"],
            ["heading-five", "H5"],
            ["heading-six", "H6"],
          ] as [SlateEditorNode["type"], string][]
        ).map(([type, label]) => (
          <ToolbarButton
            key={type}
            icon={<span>{label}</span>}
            onClick={() => toggleHeading(type)}
            isActive={activeBlockTypes[type]}
          />
        ))}

        <div className="w-px bg-background/20 mx-1 self-stretch" />

        {ALL_MARK_TYPES.map((mark) => (
          <ToolbarButton
            key={mark}
            icon={MARK_ICONS[mark]}
            onClick={() => toggleMark(editor, mark)}
            isActive={isMarkActive(editor, mark)}
          />
        ))}
      </div>
    </DynamicIsland>
  );
};

// ---------------------------------------------------------------------------
// ChatPanel — must be inside <Slate>
// ---------------------------------------------------------------------------

/** Extract plain text covered by the current selection (may be empty). */
function selectionToPlainText(editor: ReturnType<typeof useSlate>): string {
  const { selection } = editor;
  if (!selection) return "";
  const fragment = Editor.fragment(editor, selection);
  return fragment.map((node) => Node.string(node)).join("\n");
}

const ChatPanel = () => {
  const editor = useSlate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    const fullText = editor.children;
    const selectedText = selectionToPlainText(editor);

    const prompt = [
      `Here is the slate structure: ${JSON.stringify(fullText)}`,
      selectedText ? `\n## Currently selected text\n${selectedText}` : "",
      `\n## User message\n${userMessage}\nYour task is to reformat the document and send back the new slate structure with the additional information. Return a json object: { slate: { ...json slate structure... }, message: "...your message to the user..." }.\nAvailable block types: ${JSON.stringify(ALL_BLOCK_TYPES)}.\nAvailable mark (inline) types: ${JSON.stringify(ALL_MARK_TYPES)}.\nRETURN ONLY OBJECT AS IT IS ABOUT TO BE PARSED BY JSON.PARSE().`,
    ]
      .filter(Boolean)
      .join("\n");

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.aiQueryPost({ freeQueryRequest: { prompt } });
      const raw = res.text ?? "";

      // Strip markdown code fences the model sometimes wraps JSON in
      const stripped = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      let displayText = raw;
      try {
        const parsed = JSON.parse(stripped) as {
          slate?: SlateEditorNode[];
          message?: string;
        };

        if (Array.isArray(parsed.slate) && parsed.slate.length > 0) {
          // Replace the entire editor content with the AI-returned slate nodes.
          Editor.withoutNormalizing(editor, () => {
            for (let i = editor.children.length - 1; i >= 0; i--) {
              Transforms.removeNodes(editor, { at: [i] });
            }
            Transforms.insertNodes(editor, parsed.slate!, { at: [0] });
          });
        }

        displayText = parsed.message ?? "(no message)";
      } catch {
        // Not JSON — just show the raw text
      }

      setMessages((prev) => [...prev, { role: "ai", text: displayText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error: could not reach the AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50 shrink-0">
        <p className="text-sm font-semibold">AI Assistant</p>
        <p className="text-xs text-muted-foreground">
          Sends your selection &amp; document with each message
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8">
            Ask anything about your document…
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0 flex gap-2">
        <textarea
          rows={1}
          className="flex-1 resize-none bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-primary text-primary-foreground rounded-lg px-3 py-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SlateEditor — the full editor wrapper (Slate context + layout)
// ---------------------------------------------------------------------------

const SlateEditor = () => {
  const [editor] = useState(() => withReact(createEditor()));

  const initialValue = [
    {
      type: "paragraph" as const,
      children: [{ text: "This is editable " }],
    },
  ];

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <div className="flex gap-6 mt-3 h-[calc(100vh-10rem)]">
        {/* Editor column */}
        <div className="flex flex-col flex-1 min-w-0">
          <Toolbar />
          <Editable
            className="outline-none bg-card p-4 mt-2 border border-border flex-1 overflow-y-auto"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(e) => {
              const mod = e.ctrlKey || e.metaKey;
              if (!mod) return;
              if (e.key === "b") {
                e.preventDefault();
                toggleMark(editor, "bold");
              }
              if (e.key === "i") {
                e.preventDefault();
                toggleMark(editor, "italic");
              }
              if (e.key === "u") {
                e.preventDefault();
                toggleMark(editor, "underline");
              }
            }}
          />
        </div>

        {/* Chat column */}
        <div className="w-80 shrink-0">
          <ChatPanel />
        </div>
      </div>
    </Slate>
  );
};

export default memo(SlateEditor);
