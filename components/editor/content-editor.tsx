import { EditorState } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { InitialContentPlugin } from "./plugins/initial-content";

const theme = {
  paragraph: "mb-2",
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

  useEffect(() => {
    if (initialContent) {
      setMarkdownContent(initialContent);
    }
  }, [initialContent, setMarkdownContent]);

  const initialConfig = {
    namespace: "ContentEditor",
    theme,
    onError: (error: Error) => {
      console.error("Editor error:", error);
      toast.error("An error occurred in the editor.");
    },
    nodes: [],
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
        {initialContent !== undefined && (
          <InitialContentPlugin initialContent={initialContent} />
        )}
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
