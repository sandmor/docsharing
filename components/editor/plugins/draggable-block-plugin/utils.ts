const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

export function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}
