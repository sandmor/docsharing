import {
  $copyNode,
  $createParagraphNode,
  $getNodeByKey,
  $isElementNode,
  ElementNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $createListNode, $isListNode, $isListItemNode } from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { ActionHandler } from "@/components/ui/context-menu";
import { BlockContextData } from "./block-checker";

function $deepCopyNode(node: any): any {
  const clone = $copyNode(node);

  if ($isElementNode(node) && $isElementNode(clone)) {
    const children = node.getChildren();
    for (const child of children) {
      const childClone = $deepCopyNode(child);
      clone.append(childClone);
    }
  }

  return clone;
}

export const createBlockActionHandler = (editor: any): ActionHandler => ({
  handleAction: (action: string, contextData: BlockContextData) => {
    const { nodeKey } = contextData;

    if (!nodeKey || !editor) {
      return;
    }

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;

      if (action.startsWith("turn-into-")) {
        const type = action.split("-")[2];
        let newNode: ElementNode | null = null;

        try {
          if (type === "text") {
            newNode = $createParagraphNode();
          } else if (type.startsWith("h") && type.length === 2) {
            const headingLevel = type[1];
            if (["1", "2", "3", "4", "5", "6"].includes(headingLevel)) {
              newNode = $createHeadingNode(
                `h${headingLevel}` as HeadingTagType
              );
            }
          } else if (type === "bullet" || type === "ordered") {
            const listType = type === "bullet" ? "bullet" : "number";
            const list = $createListNode(listType);
            newNode = list;
          } else if (type === "code") {
            newNode = $createCodeNode();
          } else if (type === "quote") {
            newNode = $createQuoteNode();
          }

          if (newNode && $isElementNode(node)) {
            if ($isListNode(node) && !$isListNode(newNode)) {
              const children = node.getChildren();
              const [firstItem] = children.splice(0, 1);
              if ($isListItemNode(firstItem)) {
                const firstItemChildren = firstItem.getChildren();
                firstItemChildren.forEach((child) => {
                  newNode!.append(child);
                });
              }
              node.replace(newNode);
              children.forEach((child) => {
                if ($isListItemNode(child)) {
                  const itemChildren = child.getChildren();
                  itemChildren.forEach((itemChild) => {
                    const paragraph = $createParagraphNode();
                    paragraph.append(itemChild);
                    newNode!.insertAfter(paragraph);
                  });
                }
              });
            } else {
              const children = node.getChildren();
              children.forEach((child) => {
                newNode?.append(child);
              });
              node.replace(newNode);
            }
            if ($isListNode(newNode)) {
              // For lists, focus the list item
              const listItem = newNode.getFirstChild();
              if (listItem) {
                listItem.selectStart();
              }
            } else {
              newNode.selectEnd();
            }
          }
        } catch (error) {
          console.warn("Error transforming node:", error);
        }
      } else if (action === "duplicate") {
        try {
          const clonedNode = $deepCopyNode(node);
          node.insertAfter(clonedNode);
          clonedNode.selectNext();
        } catch (error) {
          console.warn("Error duplicating node:", error);
        }
      } else if (action === "delete") {
        try {
          node.remove();
        } catch (error) {
          console.warn("Error deleting node:", error);
        }
      }
    });
  },
});
