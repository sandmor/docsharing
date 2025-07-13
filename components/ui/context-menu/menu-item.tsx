import {
  MenuItemState,
  SubmenuState,
  CheckBehavior,
  ActionHandler,
  PositioningConfig,
} from "./types";
import { SubmenuPortal } from "./submenu-portal";
import { BaseMenuItem } from "./base-menu-item";

interface MenuItemProps {
  item: MenuItemState;
  depth?: number;
  path?: string;
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

export const MenuItem = ({
  item,
  depth = 0,
  path = "",
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
}: MenuItemProps) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const currentPath = path ? `${path}.${item.label}` : item.label;
  const isSubmenuOpen = submenuState.activeSubmenus.has(currentPath);

  // Process submenu items with check behavior
  const processedSubmenuItems = hasSubmenu
    ? item.submenu!.map((subItem: MenuItemState) => ({
        ...subItem,
        checked: checkBehavior.isChecked(subItem, contextData),
        disabled: checkBehavior.isDisabled?.(subItem, contextData) || false,
      }))
    : [];

  return (
    <BaseMenuItem
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
      {/* Render submenu */}
      {hasSubmenu && isSubmenuOpen && (
        <SubmenuPortal
          items={processedSubmenuItems}
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
};
