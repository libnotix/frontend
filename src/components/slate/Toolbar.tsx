import { Editor, Element, Transforms } from "slate";
import { useSlate } from "slate-react";
import { HistoryEditor } from "slate-history";
import {
  ImagePlus,
  List,
  ListOrdered,
  Redo2,
  Table2,
  Undo2,
} from "lucide-react";
import { DynamicIsland } from "@/components/dashboard/DynamicIsland";
import { API_BASE_PATH, api } from "@/lib/api";
import { getAuthCookies } from "@/actions/auth";

import { SlateEditorNode, MarkType } from "./types";
import { ALL_BLOCK_TYPES, ALL_MARK_TYPES } from "./constants";
import {
  isMarkActive,
  toggleMark,
} from "./utils";
import { ToolbarButton } from "./ToolbarButton";
import { createDefaultImageLayoutV3 } from "./imageLayout";
import { insertImageNode, insertTable } from "./tableUtils";

export const Toolbar = ({ draftId }: { draftId?: string }) => {
  const editor = useSlate();
  const { selection } = editor;

  const matchedNodes = selection
    ? Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) => !Editor.isEditor(n) && Element.isElement(n),
          mode: "lowest",
        }),
      ).map(([node]) => node)
    : [];

  const isListType = (type: SlateEditorNode["type"]) =>
    type === "unordered-list" || type === "ordered-list";

  const activeBlockTypes = Object.fromEntries(
    ALL_BLOCK_TYPES.map((t) => {
      if (isListType(t)) {
        const inList = !!(selection && Editor.above(editor, {
          at: selection,
          match: (n) => Element.isElement(n) && n.type === t,
        }));
        return [t, inList];
      }
      return [
        t,
        matchedNodes.length > 0 &&
          matchedNodes.every((n) => Element.isElement(n) && n.type === t),
      ];
    }),
  ) as Record<SlateEditorNode["type"], boolean>;

  const unwrapListsAtSelection = () => {
    if (!editor.selection) return;
    console.log("[SlateListDebug] unwrapListsAtSelection:start", {
      selection: editor.selection,
    });
    Transforms.unwrapNodes(editor, {
      at: editor.selection,
      match: (n) =>
        Element.isElement(n) &&
        (n.type === "unordered-list" || n.type === "ordered-list"),
      split: true,
    });
    console.log("[SlateListDebug] unwrapListsAtSelection:done");
  };

  const applyListType = (type: "unordered-list" | "ordered-list") => {
    console.groupCollapsed("[SlateListDebug] applyListType", type);
    console.log("[SlateListDebug] selection", editor.selection);
    console.log(
      "[SlateListDebug] top-level-types:before",
      editor.children
        .map((node) => (Element.isElement(node) ? node.type : "text"))
        .slice(0, 40),
    );
    if (editor.selection) {
      const alreadyInSameList = !!Editor.above(editor, {
        at: editor.selection,
        match: (n) => Element.isElement(n) && n.type === type,
      });
      console.log("[SlateListDebug] alreadyInSameList", alreadyInSameList);
      if (alreadyInSameList) return;
    }

    if (!editor.selection) {
      console.log("[SlateListDebug] branch:no-selection -> insert one list");
      Transforms.insertNodes(editor, {
        type,
        children: [
          {
            type: "list-item",
            children: [{ text: "" }],
          },
        ],
      } as any, {
        at: [editor.children.length],
      });
      console.log(
        "[SlateListDebug] top-level-types:after-insert",
        editor.children
          .map((node) => (Element.isElement(node) ? node.type : "text"))
          .slice(0, 40),
      );
      console.groupEnd();
      return;
    }

    console.log("[SlateListDebug] branch:selection -> wrap selection");
    Editor.withoutNormalizing(editor, () => {
      console.log("[SlateListDebug] step:unwrapListsAtSelection");
      unwrapListsAtSelection();
      console.log("[SlateListDebug] step:setNodes(list-item)");
      Transforms.setNodes(editor, { type: "list-item" } as any, {
        at: editor.selection!,
        match: (n) =>
          Element.isElement(n) &&
          n.type !== "unordered-list" &&
          n.type !== "ordered-list" &&
          n.type !== "list-item",
        mode: "lowest",
      });
      console.log("[SlateListDebug] step:wrapNodes(list-container)", type);
      Transforms.wrapNodes(
        editor,
        { type, children: [] as any },
        {
          at: editor.selection!,
          match: (n) => Element.isElement(n) && n.type === "list-item",
        },
      );
    });
    console.log(
      "[SlateListDebug] top-level-types:after-wrap",
      editor.children
        .map((node) => (Element.isElement(node) ? node.type : "text"))
        .slice(0, 40),
    );
    console.groupEnd();
  };

  const toggleBlockType = (type: SlateEditorNode["type"]) => {
    console.log("[SlateListDebug] toggleBlockType", {
      type,
      hasSelection: !!editor.selection,
    });
    if (isListType(type)) {
      applyListType(type);
      return;
    }

    unwrapListsAtSelection();
    if (editor.selection) {
      Transforms.setNodes(editor, { type } as any, {
        at: editor.selection,
        match: (n) => Element.isElement(n) && n.type === "list-item",
      });
    }
    editor.setNodes({ type });
  };

  const MARK_ICONS: Record<MarkType, React.ReactNode> = {
    bold: <strong>B</strong>,
    italic: <em>I</em>,
    underline: <u>U</u>,
    strikethrough: <s>S</s>,
    code: <code>{"</>"}</code>,
  };

  const onInsertTable = () => {
    try {
      const inserted = insertTable(editor, 2, 2);
      if (!inserted) {
        window.alert("Failed to insert table. Please try again.");
      }
    } catch (error) {
      console.error("Table insertion failed", error);
      window.alert("Failed to insert table. Please try again.");
    }
  };

  const onInsertImageFromUrl = () => {
    const src = window.prompt("Image URL");
    if (!src) return;
    const alt = window.prompt("Alt text") ?? "";
    const caption = window.prompt("Caption") ?? "";
    try {
      const inserted = insertImageNode(editor, {
        src,
        alt,
        caption,
        layout: createDefaultImageLayoutV3(),
      });
      if (!inserted) {
        window.alert("Failed to insert image.");
      }
    } catch (error) {
      console.error("Image URL insertion failed", error);
      window.alert("Failed to insert image.");
    }
  };

  const onUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      let fileId: number | undefined;
      let src = "";
      if (draftId) {
        const { accessToken } = await getAuthCookies();
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${API_BASE_PATH}/draft-images/${draftId}`, {
          method: "POST",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.message || "Failed to upload draft image");
        }
        fileId = Number(payload?.imageAsset?.assetId);
        src = typeof payload?.imageAsset?.src === "string" ? payload.imageAsset.src : "";
      } else {
        const uploadRes = await api.filesUploadPostRaw({ file });
        const uploadData = await uploadRes.raw.json();
        fileId =
          uploadData?.file?.id ||
          uploadData?.id ||
          uploadData?.fileId ||
          uploadData?.data?.id;
        src = fileId ? `asset://${fileId}` : "";
      }
      if (!fileId) throw new Error("No file id returned");
      const inserted = insertImageNode(editor, {
        src,
        alt: file.name,
        caption: file.name,
        assetId: fileId,
        layout: createDefaultImageLayoutV3(),
      });
      if (!inserted) {
        throw new Error("Image upload succeeded but insertion failed");
      }
    } catch (error) {
      console.error("Image upload failed", error);
      window.alert("Image upload or insertion failed.");
    }
  };

  return (
    <DynamicIsland>
      <div className="flex font-bold overflow-x-auto rounded-[inherit] max-w-[min(96vw,1100px)]">
        <ToolbarButton
          icon={<Undo2 size={16} />}
          onClick={() => {
            HistoryEditor.undo(editor);
          }}
          isActive={false}
          title="Undo"
        />
        <ToolbarButton
          icon={<Redo2 size={16} />}
          onClick={() => {
            HistoryEditor.redo(editor);
          }}
          isActive={false}
          title="Redo"
        />

        <div className="w-px bg-background/20 mx-1 self-stretch" />

        {(
          [
            ["paragraph", "P"],
            ["unordered-list", "unordered-list"],
            ["ordered-list", "ordered-list"],
            ["heading-one", "H1"],
            ["heading-two", "H2"],
            ["heading-three", "H3"],
          ] as [SlateEditorNode["type"], string][]
        ).map(([type, label]) => (
          <ToolbarButton
            key={type}
            icon={
              type === "unordered-list" ? (
                <List size={16} />
              ) : type === "ordered-list" ? (
                <ListOrdered size={16} />
              ) : (
                <span>{label}</span>
              )
            }
            onClick={() => toggleBlockType(type)}
            isActive={activeBlockTypes[type]}
            title={
              type === "unordered-list"
                ? "UL"
                : type === "ordered-list"
                  ? "OL"
                  : label
            }
          />
        ))}

        <div className="w-px bg-background/20 mx-1 self-stretch" />

        <ToolbarButton
          icon={<Table2 size={16} />}
          onClick={onInsertTable}
          isActive={false}
          title="Insert table"
        />
        <ToolbarButton
          icon={<ImagePlus size={16} />}
          onClick={onInsertImageFromUrl}
          isActive={false}
          title="Insert image URL"
        />
        <label className="inline-flex items-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUploadImage}
          />
          <span
            role="button"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            title="Upload image"
          >
            <ImagePlus size={16} />
          </span>
        </label>

        <div className="w-px bg-background/20 mx-1 self-stretch" />

        {ALL_MARK_TYPES.map((mark) => (
          <ToolbarButton
            key={mark}
            icon={MARK_ICONS[mark]}
            onClick={() => toggleMark(editor, mark)}
            isActive={isMarkActive(editor, mark)}
            title={mark}
          />
        ))}
      </div>
    </DynamicIsland>
  );
};
