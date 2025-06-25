import { useEffect } from "react";
import { $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

export function InitialContentPlugin({
  initialContent,
}: {
  initialContent: string;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        $convertFromMarkdownString(initialContent, TRANSFORMERS);
      });
    }
  }, [editor, initialContent]);

  return null;
}
