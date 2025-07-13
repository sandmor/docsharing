import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { BaseMenuItem } from "./base-menu-item";
import {
  MenuItemState,
  SubmenuState,
  CheckBehavior,
  ActionHandler,
  PositioningConfig,
} from "./types";

interface SubmenuPortalProps {
  items: MenuItemState[];
  position: { x: number; y: number };
  path: string;
  depth: number;
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
}

export const SubmenuPortal = ({
  items,
  position,
  path,
  depth,
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
}: SubmenuPortalProps) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -10 }}
      transition={{
        duration: 0.15,
        delay: depth * 0.05,
      }}
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] context-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, index) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const currentPath = `${path}.${item.label}`;
        const isSubmenuOpen = submenuState.activeSubmenus.has(currentPath);

        return (
          <BaseMenuItem
            key={`${item.label}-${index}`}
            item={item}
            depth={depth}
            path={path}
            contextData={contextData}
            checkBehavior={checkBehavior}
            actionHandler={actionHandler}
            submenuState={submenuState}
            anchorElement={anchorElement}
            positioning={positioning}
            onSubmenuToggle={onSubmenuToggle}
            onSubmenuPosition={onSubmenuPosition}
            onSubmenuEnter={onSubmenuEnter}
            onSubmenuLeave={onSubmenuLeave}
            onClose={onClose}
          >
            {/* Render nested submenu recursively */}
            {hasSubmenu && isSubmenuOpen && item.submenu && (
              <SubmenuPortal
                items={item.submenu.map((subItem) => ({
                  ...subItem,
                  checked: checkBehavior.isChecked(subItem, contextData),
                  disabled:
                    checkBehavior.isDisabled?.(subItem, contextData) || false,
                }))}
                position={
                  submenuState.submenuPositions[currentPath] || { x: 0, y: 0 }
                }
                path={currentPath}
                depth={depth + 1}
                contextData={contextData}
                checkBehavior={checkBehavior}
                actionHandler={actionHandler}
                submenuState={submenuState}
                anchorElement={anchorElement}
                positioning={positioning}
                onSubmenuToggle={onSubmenuToggle}
                onSubmenuPosition={onSubmenuPosition}
                onSubmenuEnter={onSubmenuEnter}
                onSubmenuLeave={onSubmenuLeave}
                onClose={onClose}
              />
            )}
          </BaseMenuItem>
        );
      })}
    </motion.div>,
    anchorElement
  );
};
