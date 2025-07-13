import { ReactNode, ComponentType } from "react";

export interface MenuItemConfig {
  label: string;
  icon: ComponentType<any>;
  action?: string;
  destructive?: boolean;
  submenu?: MenuItemConfig[];
}

export interface MenuItemState extends MenuItemConfig {
  checked?: boolean;
  disabled?: boolean;
  submenu?: MenuItemState[];
}

export interface MenuPosition {
  x: number;
  y: number;
}

export interface MenuState {
  isOpen: boolean;
  position: MenuPosition;
  activeElement: HTMLElement | null;
  originPosition: MenuPosition;
  contextData: any; // Generic context data for the menu
}

export interface SubmenuState {
  activeSubmenus: Set<string>;
  submenuPositions: Record<string, MenuPosition>;
  pendingClose: string | null;
}

export type MenuAlignment = "right" | "left";

export interface MenuConfig {
  items: MenuItemConfig[];
  title?: string;
  alignment?: MenuAlignment;
  className?: string;
  showHeader?: boolean;
}

export interface CheckBehavior {
  /**
   * Function to determine if a menu item should be checked
   * @param item - The menu item configuration
   * @param contextData - Context data passed to the menu
   * @returns boolean indicating if the item should be checked
   */
  isChecked: (item: MenuItemConfig, contextData: any) => boolean;

  /**
   * Function to determine if a menu item should be disabled
   * @param item - The menu item configuration
   * @param contextData - Context data passed to the menu
   * @returns boolean indicating if the item should be disabled
   */
  isDisabled?: (item: MenuItemConfig, contextData: any) => boolean;
}

export interface ActionHandler {
  /**
   * Function to handle menu item actions
   * @param action - The action string from the menu item
   * @param contextData - Context data passed to the menu
   */
  handleAction: (action: string, contextData: any) => void;
}

export interface PositioningConfig {
  alignment: MenuAlignment;
  offset?: { x: number; y: number };
  constraints?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

export interface ContextMenuProps {
  config: MenuConfig;
  state: MenuState;
  checkBehavior: CheckBehavior;
  actionHandler: ActionHandler;
  positioning: PositioningConfig;
  anchorElement: HTMLElement;
  onClose: () => void;
}
