import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState, useCallback } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_NORMAL,
  KEY_ESCAPE_COMMAND,
  createCommand,
  LexicalCommand,
  LexicalNode,
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
import { InsertEquationDialog } from "../equations-plugin";
import { MenuCoordinates } from "@/components/ui/context-menu/hooks/use-context-menu";

export const OPEN_SLASH_COMMAND_MENU_COMMAND: LexicalCommand<OpenSlashMenuPayload> =
  createCommand("OPEN_SLASH_COMMAND_MENU_COMMAND");

type Actions = "replace" | "insertBefore" | "insertAfter";

type OpenSlashMenuPayload = {
  coordinates: MenuCoordinates;
  node: LexicalNode;
  action: Actions;
};

export interface SlashCommandContextData {
  node: LexicalNode;
  offset: number;
  action: Actions;
}

export default function SlashCommandPlugin({
  documentId,
  anchorElem = document.body,
  menuAlignment = "left",
}: {
  documentId: string;
  anchorElem?: HTMLElement;
  menuAlignment?: MenuAlignment;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState("");
  const [isImageDialogVisible, setIsImageDialogVisible] = useState(false);
  const [isEquationDialogVisible, setIsEquationDialogVisible] = useState(false);

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

  const showMenu = useCallback(() => {
    const domSelection = window.getSelection();
    if (domSelection === null || domSelection.rangeCount === 0) {
      return;
    }
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    const target =
      domRange.startContainer instanceof Element
        ? domRange.startContainer
        : domRange.startContainer.parentElement;

    if (target) {
      const coordinates = {
        x: rect.left,
        y: rect.top,
        width: Math.max(rect.width, 1), // Ensure minimum width for collapsed selections
        height: Math.max(rect.height, 16), // Ensure minimum height for positioning
      };

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          console.error("Selection is not a range selection");
          return;
        }
        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;

        const contextData: SlashCommandContextData = {
          node: anchorNode,
          offset: anchorOffset,
          action: "replace",
        };
        openMenu(coordinates, contextData);
      });
    }
  }, [editor, openMenu]);

  const actionHandler = slashCommandActionHandler(
    editor,
    closeMenu,
    () => setIsImageDialogVisible(true),
    () => setIsEquationDialogVisible(true)
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
    const removeCommand = editor.registerCommand(
      OPEN_SLASH_COMMAND_MENU_COMMAND,
      ({ coordinates, node, action }: OpenSlashMenuPayload) => {
        const contextData: SlashCommandContextData = {
          node: node,
          offset: 0,
          action,
        };
        openMenu(coordinates, contextData);
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
    return () => removeCommand();
  }, [editor, showMenu]);

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
            if (!menuState.isOpen) {
              showMenu();
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
  }, [editor, menuState.isOpen, openMenu, closeMenu, showMenu]);

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
        documentId={documentId}
        isOpen={isImageDialogVisible}
        onClose={() => setIsImageDialogVisible(false)}
        onSubmit={(url, altText) => {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: url,
            altText,
          });
          setIsImageDialogVisible(false);
        }}
      />
      {isEquationDialogVisible && (
        <InsertEquationDialog
          activeEditor={editor}
          onClose={() => setIsEquationDialogVisible(false)}
        />
      )}
    </>
  );
}
