import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { MenuItem, SubmenuState } from "./types";
import { SubmenuPortal } from "./submenu-portal";

interface MenuItemComponentProps {
  item: MenuItem;
  depth?: number;
  path?: string;
  onAction: (action: string) => void;
  submenuState: SubmenuState;
  onSubmenuToggle: (path: string, isOpen: boolean) => void;
  onSubmenuPosition: (path: string, position: { x: number; y: number }) => void;
  onSubmenuEnter: (path: string) => void;
  onSubmenuLeave: (path: string) => void;
}

export const MenuItemComponent = ({
  item,
  depth = 0,
  path = "",
  onAction,
  submenuState,
  onSubmenuToggle,
  onSubmenuPosition,
  onSubmenuEnter,
  onSubmenuLeave,
}: MenuItemComponentProps) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const Icon = item.icon;
  const currentPath = path ? `${path}.${item.label}` : item.label;
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isSubmenuOpen = submenuState.activeSubmenus.has(currentPath);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasSubmenu) {
      if (isSubmenuOpen) {
        onSubmenuToggle(currentPath, false);
      } else {
        // Calculate submenu position
        if (itemRef.current) {
          const rect = itemRef.current.getBoundingClientRect();
          const submenuPosition = {
            x: rect.right + 4,
            y: rect.top - 8,
          };
          onSubmenuPosition(currentPath, submenuPosition);
          onSubmenuToggle(currentPath, true);
        }
      }
    } else if (item.action) {
      onAction(item.action);
    }
  };

  const handleMouseEnter = () => {
    onSubmenuEnter(currentPath);

    if (hasSubmenu && !isSubmenuOpen) {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        const submenuPosition = {
          x: rect.right + 4,
          y: rect.top - 8,
        };
        onSubmenuPosition(currentPath, submenuPosition);
        onSubmenuToggle(currentPath, true);
      }
    }
  };

  const handleMouseLeave = () => {
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
        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors relative ${
          item.destructive ? "text-red-600 hover:bg-red-50" : "text-gray-700"
        } ${isSubmenuOpen ? "bg-gray-50" : ""}`}
      >
        <div className="flex items-center">
          <Icon className="mr-3 h-4 w-4" />
          {item.label}
        </div>
        {hasSubmenu && (
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              isSubmenuOpen ? "rotate-90" : ""
            }`}
          />
        )}
      </motion.button>

      {/* Render submenu */}
      {hasSubmenu && isSubmenuOpen && (
        <SubmenuPortal
          items={item.submenu!}
          position={
            submenuState.submenuPositions[currentPath] || { x: 0, y: 0 }
          }
          path={currentPath}
          depth={depth + 1}
          onAction={onAction}
          submenuState={submenuState}
          onSubmenuToggle={onSubmenuToggle}
          onSubmenuPosition={onSubmenuPosition}
          onSubmenuEnter={onSubmenuEnter}
          onSubmenuLeave={onSubmenuLeave}
        />
      )}
    </>
  );
};
