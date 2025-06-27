import { EditorState } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { InitialContentPlugin } from "./plugins/initial-content";
import FloatingTextFormatToolbarPlugin from "./plugins/floating-text-format-toolbar-plugin";
import FloatingLinkEditorPlugin from "./plugins/floating-link-editor-plugin";
import { lexicalCodeTheme, lexicalCodeThemeVarsAuto } from "@/lib/code-theme";
import "./lexical-code-theme.css";
import CodeHighlightPlugin from "./plugins/code-hightlight";
import ToolbarPlugin from "./plugins/toolbar-plugin";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import DraggableBlockPlugin from "./plugins/draggable-block-plugin";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

const theme = {
  paragraph: "mb-2",
  heading: {
    h1: "text-3xl font-bold mb-4",
    h2: "text-2xl font-bold mb-3",
    h3: "text-xl font-bold mb-2",
    h4: "text-lg font-bold mb-2",
    h5: "text-base font-bold mb-2",
    h6: "text-sm font-bold mb-2",
  },
  list: {
    nested: {
      listitem: "list-none",
    },
    ol: "list-decimal ml-4 mb-2",
    ul: "list-disc ml-4 mb-2",
    listitem: "mb-1",
  },
  quote: "border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2",
  code: "relative block bg-transparent p-0 font-mono text-sm",
  codeHighlight: lexicalCodeTheme,
  link: "text-blue-600 underline hover:text-blue-800",
  text: {
    bold: "font-bold",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline",
    code: "bg-gray-100 rounded px-1 py-0.5 font-mono text-sm",
  },
};

interface ContentEditorProps {
  initialContent?: string;
  scrollerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ContentEditor({
  initialContent,
  scrollerRef,
}: ContentEditorProps) {
  const setMarkdownContent = useEditorStore(
    (state) => state.setMarkdownContent
  );
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const isMobile = useIsMobile();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const onChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);

        setMarkdownContent(markdown);
      });
    },
    [setMarkdownContent]
  );

  const initialConfig = {
    namespace: "ContentEditor",
    theme,
    onError: (error: Error) => {
      console.error("Editor error:", error);
      toast.error("An error occurred in the editor.");
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
  };

  return (
    <div
      className="border border-gray-300 rounded-lg flex-1 flex flex-col"
      style={lexicalCodeThemeVarsAuto}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin scrollerRef={scrollerRef} />
        <div className="relative flex-1 flex flex-col">
          <RichTextPlugin
            contentEditable={
              <div ref={onRef} className="flex-1">
                <ContentEditable className="p-4 h-full outline-none text-gray-900 resize-none leading-relaxed md:px-13 cursor-text" />
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <LinkPlugin
          attributes={{ rel: "noopener noreferrer", target: "_blank" }}
        />
        <CodeHighlightPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        {floatingAnchorElem && !isSmallScreen && (
          <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
        )}
        {floatingAnchorElem && !isMobile && (
          <>
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        )}
        {initialContent !== undefined && (
          <InitialContentPlugin initialContent={initialContent} />
        )}
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
