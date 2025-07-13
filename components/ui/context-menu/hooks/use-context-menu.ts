import { useState, useCallback, useRef, useEffect } from "react";
import { MenuState, MenuPosition, PositioningConfig } from "../types";
import { calculateMenuPosition } from "../utils";

export interface UseContextMenuProps {
  anchorElement: HTMLElement;
  positioning: PositioningConfig;
  menuDimensions?: { width: number; height: number };
}

export const useContextMenu = ({
  anchorElement,
  positioning,
  menuDimensions = { width: 220, height: 200 },
}: UseContextMenuProps) => {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    activeElement: null,
    originPosition: { x: 0, y: 0 },
    contextData: null,
  });

  const openMenu = useCallback(
    (
      triggerElement: HTMLElement,
      event: React.MouseEvent,
      contextData: any
    ) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const anchorRect = anchorElement.getBoundingClientRect();

      const position = calculateMenuPosition(
        rect,
        anchorRect,
        positioning,
        menuDimensions
      );

      const originX = rect.left + rect.width / 2 - anchorRect.left;
      const originY = rect.top + rect.height / 2 - anchorRect.top;

      setMenuState({
        isOpen: true,
        position,
        activeElement: triggerElement,
        originPosition: { x: originX, y: originY },
        contextData,
      });
    },
    [anchorElement, positioning, menuDimensions]
  );

  const closeMenu = useCallback(() => {
    setMenuState((prev) => ({
      ...prev,
      isOpen: false,
      contextData: null,
    }));
  }, []);

  const toggleMenu = useCallback(
    (
      triggerElement: HTMLElement,
      event: React.MouseEvent,
      contextData: any
    ) => {
      if (menuState.isOpen) {
        closeMenu();
      } else {
        openMenu(triggerElement, event, contextData);
      }
    },
    [menuState.isOpen, openMenu, closeMenu]
  );

  return {
    menuState,
    openMenu,
    closeMenu,
    toggleMenu,
  };
};
