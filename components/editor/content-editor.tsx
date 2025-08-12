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
import {
  $convertToMarkdownString,
  TRANSFORMERS as VENDORED_TRANSFORMERS,
} from "@lexical/markdown";
import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { InitialContentPlugin } from "./plugins/initial-content";
import FloatingTextFormatToolbarPlugin from "./plugins/floating-text-format-toolbar-plugin";
import FloatingLinkEditorPlugin from "./plugins/floating-link-editor-plugin";
import { lexicalCodeTheme, lexicalCodeThemeVarsAuto } from "@/lib/code-theme";
import "./lexical-code-theme.css";
import "./lexical.css";
import CodeHighlightPlugin from "./plugins/code-hightlight";
import ToolbarPlugin from "./plugins/toolbar-plugin";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import DraggableBlockPlugin from "./plugins/draggable-block-plugin";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import SmartListBackspacePlugin from "./plugins/smart-list-backspace-plugin";
import SlashCommandPlugin from "./plugins/slash-command-plugin";
import { DividerPlugin } from "./plugins/divider-plugin";
import {
  DividerNode,
  DIVIDER_TRANSFORMER,
} from "./plugins/divider-plugin/node";
import ImagesPlugin, { IMAGE_TRANSFORMER } from "./plugins/image-plugin";
import { ImageNode } from "./plugins/image-plugin/node";
import CodeActionMenuPlugin from "./plugins/code-action-menu-plugin";
import EquationPlugin from "./plugins/equations-plugin";
import {
  EQUATION_TRANSFORMER,
  EquationNode,
} from "./plugins/equations-plugin/equation-node";

export const TRANSFORMERS = [
  IMAGE_TRANSFORMER,
  DIVIDER_TRANSFORMER,
  EQUATION_TRANSFORMER,
  ...VENDORED_TRANSFORMERS,
];

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
    checklist: "list-none",
    listitem: "mb-1 PlaygroundEditorTheme__listItem",
    listitemChecked:
      "line-through PlaygroundEditorTheme__listItemChecked",
    listitemUnchecked:
      "PlaygroundEditorTheme__listItemUnchecked",
    nested: {
      listitem: "list-none",
    },
    ol: "list-decimal list-outside ml-4 mb-2",
    olDepth: [
      "list-decimal list-outside",
      "[list-style-type:upper-alpha] list-outside",
      "[list-style-type:lower-alpha] list-outside",
      "[list-style-type:upper-roman] list-outside",
      "[list-style-type:lower-roman] list-outside",
    ],
    ul: "list-disc list-outside ml-4 mb-2",
  },
  quote: "border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2",
  hr: "border-t border-gray-300 my-3",
  code: "font-mono lexical-code",
  codeHighlight: lexicalCodeTheme,
  image: "my-4 flex justify-center max-h-[400px]",
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
  documentId: string;
  initialContent?: string;
  scrollerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ContentEditor({
  documentId,
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
      DividerNode,
      ImageNode,
      EquationNode,
    ],
  };

  return (
    <div
      className="border border-gray-300 rounded-lg flex-1 flex flex-col"
      style={lexicalCodeThemeVarsAuto}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {!isSmallScreen && (
          <ToolbarPlugin scrollerRef={scrollerRef} position="top" />
        )}
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
        {isSmallScreen && (
          <ToolbarPlugin scrollerRef={scrollerRef} position="bottom" />
        )}
        <HistoryPlugin />
        <LinkPlugin
          attributes={{ rel: "noopener noreferrer", target: "_blank" }}
        />
        <DividerPlugin />
        <CodeHighlightPlugin />
        <ImagesPlugin />
        <EquationPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <SmartListBackspacePlugin />
        {floatingAnchorElem && !isSmallScreen && (
          <>
            <SlashCommandPlugin
              documentId={documentId}
              anchorElem={floatingAnchorElem}
            />
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
          </>
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
