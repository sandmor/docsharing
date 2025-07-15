import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { ContextMenuProps, MenuItemState, ActionHandler } from "./types";
import { MenuItem } from "./menu-item";
import { useSubmenuState } from "./hooks/use-submenu-state";
import { isMenuElement } from "./utils";

const CONTEXT_MENU_CLASS = "context-menu";

export const ContextMenu = ({
  config,
  state,
  checkBehavior,
  actionHandler,
  positioning,
  anchorElement,
  onClose,
}: ContextMenuProps) => {
  const {
    submenuState,
    handleSubmenuToggle,
    handleSubmenuPosition,
    handleSubmenuEnter,
    handleSubmenuLeave,
    resetSubmenuState,
  } = useSubmenuState(anchorElement);

  const handleAction = (action: string) => {
    actionHandler.handleAction(action, state.contextData);
    resetSubmenuState();
  };

  // Create a wrapped action handler for menu items
  const wrappedActionHandler: ActionHandler = {
    handleAction: handleAction,
  };

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        target instanceof HTMLElement &&
        isMenuElement(target, CONTEXT_MENU_CLASS)
      ) {
        return;
      }

      if (anchorElement.contains(target)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleDragStart = () => {
      onClose();
    };

    if (state.isOpen) {
      anchorElement.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      anchorElement.addEventListener("dragstart", handleDragStart);

      return () => {
        anchorElement.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        anchorElement.removeEventListener("dragstart", handleDragStart);
      };
    }
  }, [state.isOpen, anchorElement, onClose]);

  // Reset submenu state when menu closes
  useEffect(() => {
    if (!state.isOpen) {
      resetSubmenuState();
    }
  }, [state.isOpen, resetSubmenuState]);

  // Calculate transform origin based on menu position relative to origin
  const deltaX = state.position.x - state.originPosition.x;
  const deltaY = state.position.y - state.originPosition.y;

  let originX = "0%";
  let originY = "0%";

  if (deltaX < 0) originX = "100%";
  if (deltaY > 20) originY = "0%";
  if (deltaY < -20) originY = "100%";

  if (!state.isOpen) return null;

  // Process menu items with check behavior
  const processedItems: MenuItemState[] = config.items.map((item) => ({
    ...item,
    checked: checkBehavior.isChecked(item, state.contextData),
    disabled: checkBehavior.isDisabled?.(item, state.contextData) || false,
    submenu: item.submenu?.map((subItem) => ({
      ...subItem,
      checked: checkBehavior.isChecked(subItem, state.contextData),
      disabled: checkBehavior.isDisabled?.(subItem, state.contextData) || false,
    })),
  }));

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        key={`context-menu-${state.contextData?.id || "default"}`}
        initial={{
          opacity: 0,
          scale: 0.3,
          x: state.originPosition.x,
          y: state.originPosition.y,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.3,
          x: state.originPosition.x,
          y: state.originPosition.y,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.2,
        }}
        className={`${CONTEXT_MENU_CLASS} absolute z-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[220px] ${
          config.className || ""
        }`}
        style={{
          left: state.position.x,
          top: state.position.y,
          transformOrigin: `${originX} ${originY}`,
        }}
      >
        {/* Header */}
        {config.showHeader !== false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.15 }}
            className="px-3 py-2 border-b border-gray-100"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-gray-700">
                {config.title || "Menu"}
              </p>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Menu items */}
        <div className="py-1">
          {processedItems.map((item, index) => (
            <MenuItem
              key={`${item.label}-${index}`}
              item={item}
              depth={0}
              path=""
              contextData={state.contextData}
              checkBehavior={checkBehavior}
              actionHandler={wrappedActionHandler}
              submenuState={submenuState}
              anchorElement={anchorElement}
              positioning={positioning}
              onSubmenuToggle={handleSubmenuToggle}
              onSubmenuPosition={handleSubmenuPosition}
              onSubmenuEnter={handleSubmenuEnter}
              onSubmenuLeave={handleSubmenuLeave}
              onClose={onClose}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>,
    anchorElement
  );
};
