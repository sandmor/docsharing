import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState, useRef } from "react";
import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  Link,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LinkEditorDialog } from "../../link-editor-dialog";
import { $isLinkNode } from "@lexical/link";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { cn } from "@/lib/utils";

const LowPriority = 1;

function Toolbar({
  editor,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  canUndo,
  canRedo,
  openLinkEditor,
  scrollOffset,
  position,
}: {
  editor: LexicalEditor;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
  canUndo: boolean;
  canRedo: boolean;
  openLinkEditor: () => void;
  scrollOffset: number;
  position: "top" | "bottom";
}): JSX.Element {
  return (
    <div
      className={cn(
        "sticky z-10 flex mb-px bg-white p-1 vertical-align-middle border-gray-200",
        {
          "top-0": position === "top",
          "bottom-0": position === "bottom",
          "rounded-t-lg": position === "top",
          "border-b": position === "top",
          "rounded-b-lg": position === "bottom",
          "border-t": position === "bottom",
        }
      )}
      style={{
        transform: `translateY(${scrollOffset}px)`,
        willChange: "transform", // Optimize for animations
      }}
    >
      {editor.isEditable() && (
        <>
          <Button
            disabled={!canUndo}
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Undo"
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            disabled={!canRedo}
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Redo"
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Basic formatting */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            className={`h-8 w-8 p-0 ${isBold ? "bg-accent" : ""}`}
            title="Bold"
            aria-label="Format text as bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
            }
            className={`h-8 w-8 p-0 ${isItalic ? "bg-accent" : ""}`}
            title="Italic"
            aria-label="Format text as italics"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
            }
            className={`h-8 w-8 p-0 ${isUnderline ? "bg-accent" : ""}`}
            title="Underline"
            aria-label="Format text to underlined"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
            }
            className={`h-8 w-8 p-0 ${isStrikethrough ? "bg-accent" : ""}`}
            title="Strikethrough"
            aria-label="Format text with a strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Script formatting */}
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")
            }
            className={`h-8 w-8 p-0 ${isSubscript ? "bg-accent" : ""}`}
            title="Subscript"
            aria-label="Format Subscript"
          >
            <Subscript className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")
            }
            className={`h-8 w-8 p-0 ${isSuperscript ? "bg-accent" : ""}`}
            title="Superscript"
            aria-label="Format Superscript"
          >
            <Superscript className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Special formatting */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
            className={`h-8 w-8 p-0 ${isCode ? "bg-accent" : ""}`}
            title="Code"
            aria-label="Format text as code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={openLinkEditor}
            className={`h-8 w-8 p-0 ${isLink ? "bg-accent" : ""}`}
            title="Link"
            aria-label="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

export default function ToolbarPlugin({
  scrollerRef,
  position,
}: {
  scrollerRef?: React.RefObject<HTMLDivElement | null>;
  position: "top" | "bottom";
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  const rafRef = useRef<number | null>(null);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  // Handle scroll with requestAnimationFrame for smooth updates
  const handleScroll = useCallback(() => {
    if (position === "top") {
      rafRef.current = requestAnimationFrame(() => {
        const currentScrollY = scrollerRef?.current?.scrollTop || 0;
        const newOffset = -Math.min(16, currentScrollY);
        setScrollOffset(newOffset);
      });
    }
  }, [position]);

  useEffect(() => {
    // Add scroll listener
    if (scrollerRef && scrollerRef.current) {
      scrollerRef.current.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      return () => {
        if (scrollerRef.current) {
          scrollerRef.current.removeEventListener("scroll", handleScroll);
        }
      };
    }
  }, [handleScroll, scrollerRef]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  const openLinkEditor = useCallback(() => {
    setIsLinkEditorOpen(true);
  }, []);

  return (
    <>
      <Toolbar
        editor={editor}
        isLink={isLink}
        isBold={isBold}
        isItalic={isItalic}
        isStrikethrough={isStrikethrough}
        isSubscript={isSubscript}
        isSuperscript={isSuperscript}
        isUnderline={isUnderline}
        isCode={isCode}
        canUndo={canUndo}
        canRedo={canRedo}
        openLinkEditor={openLinkEditor}
        scrollOffset={0}
        position={position}
      />
      <LinkEditorDialog
        editor={editor}
        open={isLinkEditorOpen}
        onOpenChange={setIsLinkEditorOpen}
      />
    </>
  );
}
