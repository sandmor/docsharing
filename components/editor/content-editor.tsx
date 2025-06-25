import { EditorState } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useCallback } from "react";
import { toast } from "sonner";
import { InitialContentPlugin } from "./plugins/initial-content";

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
  code: "bg-gray-100 rounded px-1 py-0.5 font-mono text-sm",
  codeHighlight: {
    atrule: "text-blue-600",
    attr: "text-blue-600",
    boolean: "text-red-600",
    builtin: "text-purple-600",
    cdata: "text-gray-600",
    char: "text-green-600",
    class: "text-yellow-600",
    "class-name": "text-yellow-600",
    comment: "text-gray-500",
    constant: "text-red-600",
    deleted: "text-red-600",
    doctype: "text-gray-600",
    entity: "text-orange-600",
    function: "text-blue-600",
    important: "text-red-600",
    inserted: "text-green-600",
    keyword: "text-purple-600",
    namespace: "text-yellow-600",
    number: "text-red-600",
    operator: "text-gray-700",
    prolog: "text-gray-600",
    property: "text-blue-600",
    punctuation: "text-gray-700",
    regex: "text-orange-600",
    selector: "text-green-600",
    string: "text-green-600",
    symbol: "text-red-600",
    tag: "text-blue-600",
    url: "text-orange-600",
    variable: "text-orange-600",
  },
  link: "text-blue-600 underline hover:text-blue-800",
  text: {
    bold: "font-bold",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline",
  },
};

interface ContentEditorProps {
  initialContent?: string;
}

export default function ContentEditor({ initialContent }: ContentEditorProps) {
  const setMarkdownContent = useEditorStore(
    (state) => state.setMarkdownContent
  );

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
    <div className="border border-gray-300 rounded-lg">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="p-4 min-h-[500px] outline-none text-gray-900 resize-none leading-relaxed" />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        {initialContent !== undefined && (
          <InitialContentPlugin initialContent={initialContent} />
        )}
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
