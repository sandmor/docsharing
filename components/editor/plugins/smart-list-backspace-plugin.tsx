import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
} from "lexical";
import { useEffect } from "react";

export default function SmartListBackspacePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();

        if (anchor.offset === 0 && $isListItemNode(anchorNode)) {
          const listItem = anchorNode;

          if (listItem.getTextContent().trim() === "") {
            const parentList = listItem.getParent();

            if ($isListNode(parentList)) {
              const listItems = parentList.getChildren();

              const isLastItem = listItems[listItems.length - 1] === listItem;
              const isOnlyItem = listItems.length === 1;

              if (isLastItem || isOnlyItem) {
                event.preventDefault();

                const paragraph = $createParagraphNode();

                if (isOnlyItem) {
                  parentList.replace(paragraph);
                } else {
                  listItem.remove();
                  parentList.insertAfter(paragraph);
                }

                paragraph.select();

                return true;
              }
            }
          }
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
}
