import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { $getNearestNodeFromDOMNode, $isParagraphNode } from "lexical";
import { useRef, useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isListNode } from "@lexical/list";
import { $isCodeNode } from "@lexical/code";
import { OPEN_SLASH_COMMAND_MENU_COMMAND } from "../slash-command-plugin";

import {
  ContextMenu,
  useContextMenu,
  MenuAlignment,
  PositioningConfig,
} from "../../../ui/context-menu";
import { commonBlockMenuConfig } from "./menu-config";
import { blockCheckBehavior, BlockContextData } from "./block-checker";
import { createBlockActionHandler } from "./block-actions";
import { isOnMenu } from "./utils";
import { $isDividerNode } from "../divider-plugin/node";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

export default function DraggableBlockPlugin({
  anchorElem = document.body,
  menuAlignment = "left",
}: {
  anchorElem?: HTMLElement;
  menuAlignment?: MenuAlignment;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const [menuConfig, setMenuConfig] = useState(commonBlockMenuConfig);

  const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(
    null
  );

  const positioning: PositioningConfig = {
    alignment: menuAlignment,
    offset: { x: 0, y: 0 },
    constraints: {
      minX: 8,
      minY: 8,
      maxX: anchorElem.offsetWidth,
      maxY: anchorElem.offsetHeight,
    },
  };

  const { menuState, openMenu, closeMenu } = useContextMenu({
    anchorElement: anchorElem,
    positioning,
    menuDimensions: { width: 220, height: 200 },
  });

  const actionHandler = createBlockActionHandler(editor);

  function insertBlock(e: React.MouseEvent) {
    if (!draggableElement || !editor) {
      return;
    }

    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const coordinates = {
      x: buttonRect.left,
      y: buttonRect.top,
      width: buttonRect.width,
      height: buttonRect.height,
    };

    editor.read(() => {
      const node = $getNearestNodeFromDOMNode(draggableElement);
      if (!node) {
        return;
      }

      editor.dispatchCommand(OPEN_SLASH_COMMAND_MENU_COMMAND, {
        coordinates,
        node,
        action: e.altKey || e.ctrlKey ? "insertBefore" : "insertAfter",
      });
    });
  }

  const handleGripClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!draggableElement) return;

    let nodeKey: string | null = null;
    let blockType: string | null = null;

    editor.read(() => {
      try {
        const node = $getNearestNodeFromDOMNode(draggableElement);
        if (node) {
          nodeKey = node.getKey();
          if ($isParagraphNode(node)) {
            blockType = "text";
          } else if ($isHeadingNode(node)) {
            blockType = `h${node.getTag().substring(1)}`;
          } else if ($isListNode(node)) {
            const listType = node.getListType();
            blockType =
              listType === "bullet"
                ? "bullet-list"
                : listType === "check"
                ? "checklist"
                : "ordered-list";
          } else if ($isCodeNode(node)) {
            blockType = "code";
          } else if ($isQuoteNode(node)) {
            blockType = "quote";
          } else if ($isDividerNode(node)) {
            blockType = "divider";
          }
        }
      } catch (error) {
        console.warn("Error reading node:", error);
      }
    });

    if (!nodeKey) return;

    const contextData: BlockContextData = {
      activeBlockType: blockType,
      nodeKey,
    };

    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const coordinates = {
      x: buttonRect.left,
      y: buttonRect.top,
      width: buttonRect.width,
      height: buttonRect.height,
    };

    if (menuState.isOpen) {
      if (menuState.contextData?.nodeKey === nodeKey) {
        closeMenu();
        return;
      }
      closeMenu();
      setTimeout(() => {
        openMenu(coordinates, contextData);
      }, 50);
      return;
    }

    openMenu(coordinates, contextData);
  };

  return (
    <>
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef as any}
        targetLineRef={targetLineRef as any}
        menuComponent={
          !menuState.isOpen && (
            <div
              ref={menuRef}
              className={`absolute left-0 top-0 z-50 flex cursor-grab gap-0.5 rounded-sm p-0.5 opacity-0 will-change-transform hover:opacity-100 ${DRAGGABLE_BLOCK_MENU_CLASSNAME}`}
            >
              <button
                title="Click to add below"
                className="cursor-pointer border-none bg-transparent p-0.5 opacity-30 hover:bg-gray-200 hover:opacity-100 rounded"
                onClick={insertBlock}
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                title="More options"
                className="cursor-pointer border-none bg-transparent p-0.5 opacity-30 hover:bg-gray-200 hover:opacity-100 rounded"
                onClick={handleGripClick}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
          )
        }
        targetLineComponent={
          <div
            ref={targetLineRef}
            className="absolute left-0 top-0 h-1 w-full bg-blue-500 opacity-0 will-change-transform"
          />
        }
        isOnMenu={isOnMenu}
        onElementChanged={setDraggableElement}
      />

      <ContextMenu
        config={commonBlockMenuConfig}
        state={menuState}
        checkBehavior={blockCheckBehavior}
        actionHandler={actionHandler}
        positioning={positioning}
        anchorElement={anchorElem}
        onClose={closeMenu}
      />
    </>
  );
}
