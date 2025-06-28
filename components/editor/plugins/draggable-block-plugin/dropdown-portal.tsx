import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { DropdownState, SubmenuState } from "./types";
import { menuStructure } from "./menu-structure";
import { MenuItemComponent } from "./menu-item";
import { getSiblingPaths, isChildPath } from "./utils";

interface DropdownPortalProps {
  dropdownState: DropdownState;
  onClose: () => void;
  onAction: (action: string) => void;
  anchorElem: HTMLElement;
}

export const DropdownPortal = ({
  dropdownState,
  onClose,
  onAction,
  anchorElem,
}: DropdownPortalProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [submenuState, setSubmenuState] = useState<SubmenuState>({
    activeSubmenus: new Set(),
    submenuPositions: {},
    pendingClose: null,
  });

  const handleSubmenuToggle = (path: string, isOpen: boolean) => {
    setSubmenuState((prev) => {
      const newActiveSubmenus = new Set(prev.activeSubmenus);

      if (isOpen) {
        // Close all sibling submenus when opening a new one
        const allPaths = Array.from(prev.activeSubmenus);
        const siblingPaths = getSiblingPaths(path, allPaths);

        // Close siblings and their children
        siblingPaths.forEach((siblingPath) => {
          const pathsToClose = Array.from(newActiveSubmenus).filter(
            (p) => p === siblingPath || p.startsWith(siblingPath + ".")
          );
          pathsToClose.forEach((p) => newActiveSubmenus.delete(p));
        });

        // Add the new submenu
        newActiveSubmenus.add(path);
      } else {
        // Close this submenu and all its children
        const pathsToClose = Array.from(newActiveSubmenus).filter(
          (p) => p === path || p.startsWith(path + ".")
        );
        pathsToClose.forEach((p) => newActiveSubmenus.delete(p));
      }

      return {
        ...prev,
        activeSubmenus: newActiveSubmenus,
      };
    });
  };

  const handleSubmenuPosition = (
    path: string,
    position: { x: number; y: number }
  ) => {
    setSubmenuState((prev) => ({
      ...prev,
      submenuPositions: {
        ...prev.submenuPositions,
        [path]: position,
      },
    }));
  };

  const handleSubmenuEnter = (path: string) => {
    // Clear any pending close operations
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setSubmenuState((prev) => ({
      ...prev,
      pendingClose: null,
    }));
  };

  const handleSubmenuLeave = (path: string) => {
    // Only set up delayed close if we're leaving a leaf node (no children open)
    const hasActiveChildren = Array.from(submenuState.activeSubmenus).some(
      (activePath) => activePath.startsWith(path + ".") && activePath !== path
    );

    if (!hasActiveChildren) {
      // Clear existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      closeTimeoutRef.current = setTimeout(() => {
        setSubmenuState((prev) => {
          // Only close if we haven't entered another submenu in the meantime
          // and if this path or its children are still the ones we want to close
          if (prev.pendingClose === path) {
            const newActiveSubmenus = new Set(prev.activeSubmenus);

            // Only close this specific path, not necessarily all children
            // Check if mouse has moved to a sibling or parent
            const shouldClose = !Array.from(newActiveSubmenus).some(
              (activePath) => {
                // Don't close if mouse is in a parent path
                return isChildPath(path, activePath) && activePath !== path;
              }
            );

            if (shouldClose) {
              // Close this submenu and all its children
              const pathsToClose = Array.from(newActiveSubmenus).filter(
                (p) => p === path || p.startsWith(path + ".")
              );
              pathsToClose.forEach((p) => newActiveSubmenus.delete(p));

              return {
                ...prev,
                activeSubmenus: newActiveSubmenus,
                pendingClose: null,
              };
            }
          }
          return { ...prev, pendingClose: null };
        });
        closeTimeoutRef.current = null;
      }, 300); // 300ms delay

      setSubmenuState((prev) => ({
        ...prev,
        pendingClose: path,
      }));
    }
  };

  const handleAction = (action: string) => {
    onAction(action);
    // Clear all timeouts and reset submenu state
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSubmenuState({
      activeSubmenus: new Set(),
      submenuPositions: {},
      pendingClose: null,
    });
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Reset submenu state when dropdown closes
  useEffect(() => {
    if (!dropdownState.isOpen) {
      // Clear any pending timeouts
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      // Reset submenu state
      setSubmenuState({
        activeSubmenus: new Set(),
        submenuPositions: {},
        pendingClose: null,
      });
    }
  }, [dropdownState.isOpen]);

  // Calculate transform origin based on dropdown position relative to button
  const deltaX = dropdownState.position.x - dropdownState.originPosition.x;
  const deltaY = dropdownState.position.y - dropdownState.originPosition.y;

  let originX = "0%";
  let originY = "0%";

  if (deltaX < 0) originX = "100%";
  if (deltaY > 20) originY = "0%";
  if (deltaY < -20) originY = "100%";

  if (!dropdownState.lockedNodeKey) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {dropdownState.isOpen && (
        <motion.div
          key={`dropdown-${dropdownState.lockedNodeKey || "default"}`}
          ref={dropdownRef}
          initial={{
            opacity: 0,
            scale: 0.3,
            x: dropdownState.originPosition.x - dropdownState.position.x,
            y: dropdownState.originPosition.y - dropdownState.position.y,
          }}
          data-dropdown-portal
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.3,
            x: dropdownState.originPosition.x - dropdownState.position.x,
            y: dropdownState.originPosition.y - dropdownState.position.y,
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.2,
          }}
          className="absolute z-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[220px]"
          style={{
            left: dropdownState.position.x,
            top: dropdownState.position.y,
            transformOrigin: `${originX} ${originY}`,
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.15 }}
            className="px-3 py-2 border-b border-gray-100"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-gray-700">Block Actions</p>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>

          {/* Menu items */}
          <div className="py-1">
            {menuStructure.map((item, index) => (
              <MenuItemComponent
                key={`${item.label}-${index}`}
                item={item}
                depth={0}
                path=""
                onAction={handleAction}
                submenuState={submenuState}
                onSubmenuToggle={handleSubmenuToggle}
                onSubmenuPosition={handleSubmenuPosition}
                onSubmenuEnter={handleSubmenuEnter}
                onSubmenuLeave={handleSubmenuLeave}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    anchorElem
  );
};
