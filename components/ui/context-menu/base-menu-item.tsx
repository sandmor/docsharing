import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronRight, Check } from "lucide-react";
import {
  MenuItemState,
  SubmenuState,
  CheckBehavior,
  ActionHandler,
  PositioningConfig,
} from "./types";
import { createMenuItemPath, calculateSubmenuPosition } from "./utils";

export interface BaseMenuItemProps {
  item: MenuItemState;
  depth: number;
  path: string;
  contextData: any;
  checkBehavior: CheckBehavior;
  actionHandler: ActionHandler;
  submenuState: SubmenuState;
  anchorElement: HTMLElement;
  positioning?: PositioningConfig;
  onSubmenuToggle: (path: string, isOpen: boolean) => void;
  onSubmenuPosition: (path: string, position: { x: number; y: number }) => void;
  onSubmenuEnter: (path: string) => void;
  onSubmenuLeave: (path: string) => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export const BaseMenuItem = ({
  item,
  depth,
  path,
  contextData,
  checkBehavior,
  actionHandler,
  submenuState,
  anchorElement,
  positioning,
  onSubmenuToggle,
  onSubmenuPosition,
  onSubmenuEnter,
  onSubmenuLeave,
  onClose,
  children,
}: BaseMenuItemProps) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const Icon = item.icon;
  const currentPath = createMenuItemPath(path, item.label);
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isSubmenuOpen = submenuState.activeSubmenus.has(currentPath);

  // Determine checked and disabled states
  const isChecked = checkBehavior.isChecked(item, contextData);
  const isDisabled = checkBehavior.isDisabled?.(item, contextData) || false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDisabled) return;

    if (hasSubmenu) {
      if (isSubmenuOpen) {
        onSubmenuToggle(currentPath, false);
      } else {
        // Calculate submenu position
        if (itemRef.current) {
          const rect = itemRef.current.getBoundingClientRect();
          const anchorRect = anchorElement.getBoundingClientRect();
          const submenuPosition = calculateSubmenuPosition(
            rect,
            anchorRect,
            { width: 220, height: 200 }, // Default submenu dimensions
            positioning
          );
          onSubmenuPosition(currentPath, submenuPosition);
          onSubmenuToggle(currentPath, true);
        }
      }
    } else if (item.action) {
      actionHandler.handleAction(item.action, contextData);
      onClose();
    }
  };

  const handleMouseEnter = () => {
    if (isDisabled) return;

    onSubmenuEnter(currentPath);

    if (hasSubmenu && !isSubmenuOpen) {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        const anchorRect = anchorElement.getBoundingClientRect();
        const submenuPosition = calculateSubmenuPosition(
          rect,
          anchorRect,
          { width: 220, height: 200 }, // Default submenu dimensions
          positioning
        );
        onSubmenuPosition(currentPath, submenuPosition);
        onSubmenuToggle(currentPath, true);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDisabled) return;
    onSubmenuLeave(currentPath);
  };

  return (
    <>
      <motion.button
        ref={itemRef}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{
          delay: 0.05 + depth * 0.02,
          duration: 0.15,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={isDisabled}
        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors relative ${
          isDisabled
            ? "text-gray-400 cursor-not-allowed"
            : item.destructive
            ? "text-red-600 hover:bg-red-50 cursor-pointer"
            : "text-gray-700 hover:bg-gray-50 cursor-pointer"
        } ${isSubmenuOpen ? "bg-gray-50" : ""}`}
      >
        <div className="flex items-center">
          <Icon className="mr-3 h-4 w-4" />
          {item.label}
        </div>
        <div className="flex items-center">
          {isChecked && <Check className="h-4 w-4 mr-2" />}
          {hasSubmenu && (
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isSubmenuOpen ? "rotate-90" : ""
              }`}
            />
          )}
        </div>
      </motion.button>

      {/* Render any children (e.g., submenus) */}
      {children}
    </>
  );
};
