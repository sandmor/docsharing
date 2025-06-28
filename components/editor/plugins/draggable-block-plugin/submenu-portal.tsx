import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { MenuItem, SubmenuState } from "./types";
import { MenuItemComponent } from "./menu-item";

interface SubmenuPortalProps {
  items: MenuItem[];
  position: { x: number; y: number };
  path: string;
  depth: number;
  onAction: (action: string) => void;
  submenuState: SubmenuState;
  onSubmenuToggle: (path: string, isOpen: boolean) => void;
  onSubmenuPosition: (path: string, position: { x: number; y: number }) => void;
  onSubmenuEnter: (path: string) => void;
  onSubmenuLeave: (path: string) => void;
}

export const SubmenuPortal = ({
  items,
  position,
  path,
  depth,
  onAction,
  submenuState,
  onSubmenuToggle,
  onSubmenuPosition,
  onSubmenuEnter,
  onSubmenuLeave,
}: SubmenuPortalProps) => {
  const submenuRef = useRef<HTMLDivElement>(null);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (submenuRef.current) {
      const rect = submenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedPosition = { ...position };

      // Adjust horizontal position if submenu goes off-screen
      if (rect.right > viewportWidth) {
        adjustedPosition.x = position.x - rect.width - 8;
      }

      // Adjust vertical position if submenu goes off-screen
      if (rect.bottom > viewportHeight) {
        adjustedPosition.y = viewportHeight - rect.height - 16;
      }

      // Apply adjusted position if different
      if (
        adjustedPosition.x !== position.x ||
        adjustedPosition.y !== position.y
      ) {
        onSubmenuPosition(path, adjustedPosition);
      }
    }
  }, [position, path, onSubmenuPosition]);

  const handleMouseEnter = () => {
    onSubmenuEnter(path);
  };

  const handleMouseLeave = () => {
    onSubmenuLeave(path);
  };

  return createPortal(
    <motion.div
      ref={submenuRef}
      initial={{
        opacity: 0,
        scale: 0.95,
        x: -10,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        x: -10,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 400,
        duration: 0.15,
      }}
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]"
      style={{
        left: position.x,
        top: position.y,
        transformOrigin: "left top",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {items.map((item, index) => (
        <MenuItemComponent
          key={`${item.label}-${index}`}
          item={item}
          depth={depth}
          path={path}
          onAction={onAction}
          submenuState={submenuState}
          onSubmenuToggle={onSubmenuToggle}
          onSubmenuPosition={onSubmenuPosition}
          onSubmenuEnter={onSubmenuEnter}
          onSubmenuLeave={onSubmenuLeave}
        />
      ))}
    </motion.div>,
    document.body
  );
};
