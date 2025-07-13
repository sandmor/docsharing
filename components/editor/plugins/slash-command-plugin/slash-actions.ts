import { $createParagraphNode, TextNode } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import {
  $createListNode,
  $createListItemNode,
  $isListNode,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { $createQuoteNode } from "@lexical/rich-text";
import { ActionHandler } from "@/components/ui/context-menu";
import { $createDividerNode } from "../divider-plugin/node";
import { INSERT_IMAGE_COMMAND } from "../image-plugin";

interface SlashCommandContextData {
  textNode: TextNode;
  offset: number;
}

export const slashCommandActionHandler = (
  editor: any,
  closeMenu: () => void,
  openImageDialog: () => void
): ActionHandler => ({
  handleAction: (action: string, contextData: SlashCommandContextData) => {
    const { textNode } = contextData;

    if (!textNode || !editor) {
      return;
    }

    editor.update(() => {
      const parentNode = textNode.getParent();
      if (!parentNode) return;

      // Remove the slash command text
      const textContent = textNode.getTextContent();
      const slashMatch = textContent.match(/^\/.*$/);
      if (slashMatch) {
        textNode.setTextContent("");
      }

      let newNode;

      try {
        switch (action) {
          case "insert-text":
            newNode = $createParagraphNode();
            break;
          case "insert-h1":
            newNode = $createHeadingNode("h1");
            break;
          case "insert-h2":
            newNode = $createHeadingNode("h2");
            break;
          case "insert-h3":
            newNode = $createHeadingNode("h3");
            break;
          case "insert-h4":
            newNode = $createHeadingNode("h4");
            break;
          case "insert-h5":
            newNode = $createHeadingNode("h5");
            break;
          case "insert-h6":
            newNode = $createHeadingNode("h6");
            break;
          case "insert-bullet-list":
            newNode = $createListNode("bullet");
            const bulletItem = $createListItemNode();
            newNode.append(bulletItem);
            break;
          case "insert-ordered-list":
            newNode = $createListNode("number");
            const numberedItem = $createListItemNode();
            newNode.append(numberedItem);
            break;
          case "insert-code":
            newNode = $createCodeNode();
            break;
          case "insert-quote":
            newNode = $createQuoteNode();
            break;
          case "insert-divider":
            newNode = $createDividerNode();
            break;
          case "insert-image":
            openImageDialog();
            break;
          default:
            newNode = $createParagraphNode();
        }

        if (newNode) {
          // Replace the current paragraph with the new node
          parentNode.replace(newNode);

          // Focus the new node
          if ($isListNode(newNode)) {
            // For lists, focus the list item
            const listItem = newNode.getChildren()[0];
            if (listItem) {
              listItem.selectStart();
            }
          } else {
            // For other nodes, focus the node itself
            newNode.selectStart();
          }
        }
      } catch (error) {
        console.warn("Error creating node:", error);
      }
    });

    closeMenu();
  },
});
