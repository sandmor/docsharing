import { useEffect, useRef } from "react";
import { $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { TRANSFORMERS } from "../content-editor";

export function InitialContentPlugin({
  initialContent,
}: {
  initialContent: string;
}) {
  const [editor] = useLexicalComposerContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current || !initialContent) {
      return;
    }

    isInitialized.current = true;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      $convertFromMarkdownString(initialContent, TRANSFORMERS);
    });
  }, [editor, initialContent]);

  return null;
}
