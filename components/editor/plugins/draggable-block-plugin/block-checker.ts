import { CheckBehavior, MenuItemConfig } from "@/components/ui/context-menu";

export interface BlockContextData {
  activeBlockType: string | null;
  nodeKey: string;
}

export const blockCheckBehavior: CheckBehavior = {
  isChecked: (item: MenuItemConfig, contextData: BlockContextData) => {
    if (!item.action || !contextData.activeBlockType) {
      return false;
    }

    // Extract the block type from the action
    // e.g., "turn-into-h1" -> "h1", "turn-into-text" -> "text"
    const actionParts = item.action.split("-");
    if (
      actionParts.length < 3 ||
      actionParts[0] !== "turn" ||
      actionParts[1] !== "into"
    ) {
      return false;
    }

    const targetBlockType = actionParts.slice(2).join("-");
    return targetBlockType === contextData.activeBlockType;
  },
};
