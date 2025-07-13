import { MenuPosition, PositioningConfig } from "./types";

export const getParentPath = (path: string): string => {
  const parts = path.split(".");
  return parts.slice(0, -1).join(".");
};

export const isChildPath = (childPath: string, parentPath: string): boolean => {
  return childPath.startsWith(parentPath + ".") || childPath === parentPath;
};

export const getSiblingPaths = (path: string, allPaths: string[]): string[] => {
  const parentPath = getParentPath(path);
  return allPaths.filter((p) => {
    const pParent = getParentPath(p);
    return pParent === parentPath && p !== path;
  });
};

export const calculateMenuPosition = (
  triggerRect: DOMRect,
  anchorRect: DOMRect,
  config: PositioningConfig,
  menuDimensions: { width: number; height: number }
): MenuPosition => {
  const { alignment, offset = { x: 0, y: 0 }, constraints } = config;
  const { width: menuWidth, height: menuHeight } = menuDimensions;
  const spacing = 8;

  const anchorWidth = anchorRect.width;
  const anchorHeight = anchorRect.height;

  // Calculate base positions
  const rightPosition =
    triggerRect.right - anchorRect.left + spacing + offset.x;
  const leftPosition =
    triggerRect.left - anchorRect.left - menuWidth - spacing + offset.x;
  const yPosition = triggerRect.top - anchorRect.top + offset.y;

  let finalX: number;

  // Handle horizontal positioning
  switch (alignment) {
    case "left":
      if (leftPosition >= (constraints?.minX ?? 0)) {
        finalX = leftPosition;
      } else {
        finalX = rightPosition;
      }
      break;

    case "right":
    default:
      if (rightPosition + menuWidth <= (constraints?.maxX ?? anchorWidth)) {
        finalX = rightPosition;
      } else {
        finalX = leftPosition;
      }
      break;
  }

  // Apply constraints
  finalX = Math.max(
    constraints?.minX ?? spacing,
    Math.min(finalX, (constraints?.maxX ?? anchorWidth) - menuWidth - spacing)
  );

  // Handle vertical positioning
  let finalY = yPosition;
  if (finalY + menuHeight > (constraints?.maxY ?? anchorHeight)) {
    finalY = (constraints?.maxY ?? anchorHeight) - menuHeight - spacing;
  }
  finalY = Math.max(constraints?.minY ?? spacing, finalY);

  return { x: finalX, y: finalY };
};

export const calculateSubmenuPosition = (
  parentRect: DOMRect,
  anchorRect: DOMRect,
  submenuDimensions: { width: number; height: number },
  positioning?: PositioningConfig
): MenuPosition => {
  const spacing = 4;
  const { width: submenuWidth, height: submenuHeight } = submenuDimensions;
  const { alignment = "right", constraints } = positioning || {};

  // Calculate base positions based on alignment
  let x: number;
  let y = parentRect.top - anchorRect.top - 8;

  // For submenus, we generally want them to appear to the right or left
  // but respect the parent's alignment preference when there's a conflict
  const rightPosition = parentRect.right - anchorRect.left + spacing;
  const leftPosition =
    parentRect.left - anchorRect.left - submenuWidth - spacing;

  // Default to right side for submenus
  if (alignment === "left") {
    // If parent prefers left alignment, try left first
    if (leftPosition >= (constraints?.minX ?? 0)) {
      x = leftPosition;
    } else {
      x = rightPosition;
    }
  } else {
    // If parent prefers right alignment, try right first
    if (
      rightPosition + submenuWidth <=
      (constraints?.maxX ?? anchorRect.width)
    ) {
      x = rightPosition;
    } else {
      x = leftPosition;
    }
  }

  // Apply constraints consistently with main menu
  x = Math.max(
    constraints?.minX ?? spacing,
    Math.min(
      x,
      (constraints?.maxX ?? anchorRect.width) - submenuWidth - spacing
    )
  );

  // Handle vertical positioning with constraints
  if (y + submenuHeight > (constraints?.maxY ?? anchorRect.height)) {
    y = (constraints?.maxY ?? anchorRect.height) - submenuHeight - spacing;
  }
  y = Math.max(constraints?.minY ?? spacing, y);

  return { x, y };
};

export const createMenuItemPath = (
  parentPath: string,
  itemLabel: string
): string => {
  return parentPath ? `${parentPath}.${itemLabel}` : itemLabel;
};

export const isMenuElement = (
  element: HTMLElement,
  menuClassName: string
): boolean => {
  return !!element.closest(`.${menuClassName}`);
};
