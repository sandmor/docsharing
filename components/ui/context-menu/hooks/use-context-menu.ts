import { useState, useCallback, useRef, useEffect } from "react";
import { MenuState, MenuPosition, PositioningConfig } from "../types";
import { calculateMenuPosition } from "../utils";

export interface UseContextMenuProps {
  anchorElement: HTMLElement;
  positioning: PositioningConfig;
  menuDimensions?: { width: number; height: number };
}

export interface MenuCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useContextMenu = ({
  anchorElement,
  positioning,
  menuDimensions = { width: 220, height: 200 },
}: UseContextMenuProps) => {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    originPosition: { x: 0, y: 0 },
    contextData: null,
  });

  const openMenu = useCallback(
    (coordinates: MenuCoordinates, contextData: any = null) => {
      const rect = {
        left: coordinates.x,
        top: coordinates.y,
        width: coordinates.width,
        height: coordinates.height,
        right: coordinates.x + coordinates.width,
        bottom: coordinates.y + coordinates.height,
        x: coordinates.x,
        y: coordinates.y,
        toJSON: () => ({}),
      } as DOMRect;
      const anchorRect = anchorElement.getBoundingClientRect();

      const position = calculateMenuPosition(
        rect,
        anchorRect,
        positioning,
        menuDimensions
      );

      // Convert trigger coordinates to anchor-relative coordinates
      const triggerCenterX = rect.left + rect.width / 2 - anchorRect.left;
      const triggerCenterY = rect.top + rect.height / 2 - anchorRect.top;

      // Calculate origin relative to final menu position
      const originX = triggerCenterX - position.x;
      const originY = triggerCenterY - position.y;

      setMenuState({
        isOpen: true,
        position,
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
    (coordinates: MenuCoordinates, contextData: any = null) => {
      if (menuState.isOpen) {
        closeMenu();
      } else {
        openMenu(coordinates, contextData);
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
