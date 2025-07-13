import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import {
  $copyNode,
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $isElementNode,
  ElementNode,
} from "lexical";
import { useRef, useState, useEffect } from "react";
import { Plus, GripVertical } from "lucide-react";
import {
  $createHeadingNode,
  HeadingTagType,
  $isHeadingNode,
} from "@lexical/rich-text";
import {
  $createListItemNode,
  $createListNode,
  ListType,
  $isListNode,
  $isListItemNode,
} from "@lexical/list";
import { $createCodeNode, $isCodeNode } from "@lexical/code";

import { DropdownState, MenuAlignment } from "./types";
import { $deepCopyNode, isOnMenu } from "./utils";
import { DropdownPortal } from "./dropdown-portal";

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

  const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(
    null
  );
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    activeElement: null,
    originPosition: { x: 0, y: 0 },
    lockedNodeKey: null,
  });
  const [activeBlockType, setActiveBlockType] = useState<string | null>(null);

  function insertBlock(e: React.MouseEvent) {
    if (!draggableElement || !editor) {
      return;
    }

    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(draggableElement);
      if (!node) {
        return;
      }

      const pNode = $createParagraphNode();
      if (e.altKey || e.ctrlKey) {
        node.insertBefore(pNode);
      } else {
        node.insertAfter(pNode);
      }
      pNode.select();
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
          if ($isHeadingNode(node)) {
            blockType = `h${node.getTag().substring(1)}`;
          } else if ($isListNode(node)) {
            blockType =
              node.getListType() === "bullet" ? "bullet-list" : "ordered-list";
          } else if ($isCodeNode(node)) {
            blockType = "code";
          } else {
            blockType = "text";
          }
        }
      } catch (error) {
        console.warn("Error reading node:", error);
      }
    });

    if (!nodeKey) return;

    setActiveBlockType(blockType);

    if (dropdownState.isOpen) {
      if (dropdownState.lockedNodeKey === nodeKey) {
        closeDropdown();
        return;
      }
      closeDropdown();
      setTimeout(
        () => openDropdownForElement(draggableElement, nodeKey!, e),
        50
      );
      return;
    }

    openDropdownForElement(draggableElement, nodeKey, e);
  };

  const calculateDropdownPosition = (
    rect: DOMRect,
    anchorRect: DOMRect,
    alignment: MenuAlignment
  ): { x: number; y: number } => {
    const anchorWidth = anchorElem.offsetWidth;
    const anchorHeight = anchorElem.offsetHeight;
    const dropdownWidth = 220;
    const dropdownHeight = 200;
    const spacing = 8;

    const rightPosition = rect.right - anchorRect.left + spacing;
    const leftPosition = rect.left - anchorRect.left - dropdownWidth - spacing;
    const yPosition = rect.top - anchorRect.top;

    let finalX: number;

    switch (alignment) {
      case "left":
        if (leftPosition >= 0) {
          finalX = leftPosition;
        } else {
          finalX = rightPosition;
        }
        break;

      case "right":
      default:
        if (rightPosition + dropdownWidth <= anchorWidth) {
          finalX = rightPosition;
        } else {
          finalX = leftPosition;
        }
        break;
    }

    finalX = Math.max(
      spacing,
      Math.min(finalX, anchorWidth - dropdownWidth - spacing)
    );

    let finalY = yPosition;
    if (finalY + dropdownHeight > anchorHeight) {
      finalY = anchorHeight - dropdownHeight - spacing;
    }
    finalY = Math.max(spacing, finalY);

    return { x: finalX, y: finalY };
  };

  const openDropdownForElement = (
    element: HTMLElement,
    nodeKey: string,
    e: React.MouseEvent
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const anchorRect = anchorElem.getBoundingClientRect();

    const position = calculateDropdownPosition(rect, anchorRect, menuAlignment);

    const originX = rect.left + rect.width / 2 - anchorRect.left;
    const originY = rect.top + rect.height / 2 - anchorRect.top;

    setDropdownState({
      isOpen: true,
      position,
      activeElement: element,
      originPosition: { x: originX, y: originY },
      lockedNodeKey: nodeKey,
    });
  };

  const closeDropdown = () => {
    setDropdownState((prev) => ({
      ...prev,
      isOpen: false,
      lockedNodeKey: null,
    }));
  };

  const handleDropdownAction = (action: string) => {
    const targetNodeKey = dropdownState.lockedNodeKey;

    if (!targetNodeKey || !editor) {
      closeDropdown();
      return;
    }

    editor.update(() => {
      const node = $getNodeByKey(targetNodeKey);
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
          }

          if (newNode && $isElementNode(node)) {
            const children = node.getChildren();
            children.forEach((child) => {
              newNode?.append(child);
            });
            node.replace(newNode);
            newNode.select();
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

    closeDropdown();
  };

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const dropdownElement = anchorElem.querySelector(
        "[data-dropdown-portal]"
      );
      if (dropdownElement && dropdownElement.contains(target)) {
        return;
      }

      if (target instanceof HTMLElement && isOnMenu(target)) {
        return;
      }

      if (anchorElem.contains(target)) {
        closeDropdown();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    const handleDragStart = () => {
      closeDropdown();
    };

    if (dropdownState.isOpen) {
      anchorElem.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      anchorElem.addEventListener("dragstart", handleDragStart);

      return () => {
        anchorElem.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        anchorElem.removeEventListener("dragstart", handleDragStart);
      };
    }
  }, [dropdownState.isOpen, anchorElem]);

  return (
    <>
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef as any}
        targetLineRef={targetLineRef as any}
        menuComponent={
          <div
            ref={menuRef}
            className={`absolute left-0 top-0 z-50 flex cursor-grab gap-0.5 rounded-sm bg-white p-0.5 opacity-0 will-change-transform hover:opacity-100 ${DRAGGABLE_BLOCK_MENU_CLASSNAME}`}
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

      <DropdownPortal
        dropdownState={dropdownState}
        onClose={closeDropdown}
        onAction={handleDropdownAction}
        anchorElem={anchorElem}
        activeBlockType={activeBlockType}
      />
    </>
  );
}
