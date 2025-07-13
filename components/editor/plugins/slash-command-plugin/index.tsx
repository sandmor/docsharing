import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState, useCallback } from "react";
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
  $isTextNode,
  COMMAND_PRIORITY_NORMAL,
  KEY_ESCAPE_COMMAND,
} from "lexical";

import {
  ContextMenu,
  useContextMenu,
  MenuAlignment,
  PositioningConfig,
  MenuItemConfig,
} from "@/components/ui/context-menu";
import { slashCommandMenuConfig } from "./menu-config";
import { slashCommandActionHandler } from "./slash-actions";
import ImageDialog from "../image-plugin/image-dialog";
import { INSERT_IMAGE_COMMAND } from "../image-plugin";

interface SlashCommandContextData {
  textNode: TextNode;
  offset: number;
}

export default function SlashCommandPlugin({
  anchorElem = document.body,
  menuAlignment = "left",
}: {
  anchorElem?: HTMLElement;
  menuAlignment?: MenuAlignment;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState("");
  const [isImageDialogVisible, setIsImageDialogVisible] = useState(false);

  const positioning: PositioningConfig = {
    alignment: menuAlignment,
    offset: { x: 0, y: 24 },
    constraints: {
      minX: 8,
      minY: 8,
      maxX: anchorElem.offsetWidth - 220,
      maxY: anchorElem.offsetHeight - 200,
    },
  };

  const { menuState, openMenu, closeMenu } = useContextMenu({
    anchorElement: anchorElem,
    positioning,
    menuDimensions: { width: 220, height: 200 },
  });

  const actionHandler = slashCommandActionHandler(editor, closeMenu, () =>
    setIsImageDialogVisible(true)
  );

  const filteredItems = slashCommandMenuConfig.items.filter(
    (item: MenuItemConfig) =>
      item.label.toLowerCase().includes(queryString.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!menuState.isOpen) return false;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          closeMenu();
          return true;
        default:
          return false;
      }
    },
    [menuState.isOpen, closeMenu]
  );

  useEffect(() => {
    const removeEscapeListener = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => handleKeyDown({ key: "Escape" } as KeyboardEvent),
      COMMAND_PRIORITY_NORMAL
    );

    return () => {
      removeEscapeListener();
    };
  }, [editor, handleKeyDown]);

  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          if (menuState.isOpen) {
            closeMenu();
          }
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;

        if (!$isTextNode(anchorNode)) {
          if (menuState.isOpen) {
            closeMenu();
          }
          return;
        }

        const textContent = anchorNode.getTextContent();
        const textUpToCursor = textContent.slice(0, anchorOffset);

        // Check if we have a slash at the beginning of the line/node
        const slashMatch = textUpToCursor.match(/^\/(.*)$/);

        if (slashMatch) {
          const query = slashMatch[1];
          setQueryString(query);

          // Check if the text node is at the beginning of a paragraph and is empty except for the slash command
          const parentNode = anchorNode.getParent();
          if (parentNode && textContent.startsWith("/")) {
            const contextData: SlashCommandContextData = {
              textNode: anchorNode,
              offset: anchorOffset,
            };

            if (!menuState.isOpen) {
              // Get the DOM node to position the menu
              const domNode = editor.getElementByKey(anchorNode.getKey());
              if (domNode) {
                const rect = domNode.getBoundingClientRect();
                const fakeEvent = {
                  currentTarget: domNode,
                  clientX: rect.left,
                  clientY: rect.bottom,
                  getBoundingClientRect: () => rect,
                } as any;
                openMenu(domNode, fakeEvent, contextData);
              }
            }
          }
        } else {
          if (menuState.isOpen) {
            closeMenu();
          }
        }
      });
    });

    return updateListener;
  }, [editor, menuState.isOpen, openMenu, closeMenu]);

  return (
    <>
      <ContextMenu
        config={{
          ...slashCommandMenuConfig,
          items: filteredItems.map((item: MenuItemConfig, index: number) => ({
            ...item,
          })),
        }}
        state={menuState}
        checkBehavior={{
          isChecked: () => false,
          isDisabled: () => false,
        }}
        actionHandler={actionHandler}
        positioning={positioning}
        anchorElement={anchorElem}
        onClose={closeMenu}
      />
      <ImageDialog
        isOpen={isImageDialogVisible}
        onClose={() => setIsImageDialogVisible(false)}
        onSubmit={(url) => {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: url,
            altText: "User-provided image",
          });
          setIsImageDialogVisible(false);
        }}
      />
    </>
  );
}
