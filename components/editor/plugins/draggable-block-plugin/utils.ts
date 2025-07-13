import { $copyNode, $isElementNode, LexicalNode } from "lexical";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

export function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export const getParentPath = (path: string): string => {
  const parts = path.split(".");
  return parts.slice(0, -1).join(".");
};

export const isChildPath = (childPath: string, parentPath: string): boolean => {
  return childPath.startsWith(parentPath + ".") || childPath === parentPath;
};

export const getSiblingPaths = (path: string, allPaths: string[]): string[] => {
  const parentPath = getParentPath(path);
  return allPaths.filter((p) => {
    const pParent = getParentPath(p);
    return pParent === parentPath && p !== path;
  });
};

export function $deepCopyNode(node: LexicalNode): LexicalNode {
  const clone = $copyNode(node);

  if ($isElementNode(node) && $isElementNode(clone)) {
    const children = node.getChildren();
    for (const child of children) {
      const childClone = $deepCopyNode(child);
      clone.append(childClone);
    }
  }

  return clone;
}
