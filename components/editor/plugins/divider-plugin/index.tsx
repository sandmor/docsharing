import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createDividerNode, INSERT_DIVIDER_COMMAND } from "./node";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { useEffect } from "react";

export function DividerPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_DIVIDER_COMMAND,
      (type) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const focusNode = selection.focus.getNode();

        if (focusNode !== null) {
          const dividerNode = $createDividerNode();
          $insertNodeToNearestRoot(dividerNode);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
