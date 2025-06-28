interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  action?: string;
  destructive?: boolean;
  submenu?: MenuItem[];
  checked?: boolean;
}

interface DropdownState {
  isOpen: boolean;
  position: { x: number; y: number };
  activeElement: HTMLElement | null;
  originPosition: { x: number; y: number };
  lockedNodeKey: string | null;
}

interface SubmenuState {
  activeSubmenus: Set<string>;
  submenuPositions: Record<string, { x: number; y: number }>;
  pendingClose: string | null;
}

type MenuAlignment = "right" | "left";

export type { MenuItem, DropdownState, SubmenuState, MenuAlignment };
