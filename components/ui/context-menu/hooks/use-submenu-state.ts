import { useState, useCallback, useRef, useEffect } from "react";
import { SubmenuState, MenuPosition } from "../types";
import { getSiblingPaths, isChildPath } from "../utils";

export const useSubmenuState = (anchorElement: HTMLElement) => {
  const [submenuState, setSubmenuState] = useState<SubmenuState>({
    activeSubmenus: new Set(),
    submenuPositions: {},
    pendingClose: null,
  });

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmenuToggle = useCallback((path: string, isOpen: boolean) => {
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
  }, []);

  const handleSubmenuPosition = useCallback(
    (path: string, position: MenuPosition) => {
      setSubmenuState((prev) => ({
        ...prev,
        submenuPositions: {
          ...prev.submenuPositions,
          [path]: position,
        },
      }));
    },
    []
  );

  const handleSubmenuEnter = useCallback((path: string) => {
    // Clear any pending close operations
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setSubmenuState((prev) => ({
      ...prev,
      pendingClose: null,
    }));
  }, []);

  const handleSubmenuLeave = useCallback(
    (path: string) => {
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
            if (prev.pendingClose === path) {
              const newActiveSubmenus = new Set(prev.activeSubmenus);

              // Only close this specific path, not necessarily all children
              const shouldClose = !Array.from(newActiveSubmenus).some(
                (activePath) => {
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
    },
    [submenuState.activeSubmenus]
  );

  const resetSubmenuState = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setSubmenuState({
      activeSubmenus: new Set(),
      submenuPositions: {},
      pendingClose: null,
    });
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return {
    submenuState,
    handleSubmenuToggle,
    handleSubmenuPosition,
    handleSubmenuEnter,
    handleSubmenuLeave,
    resetSubmenuState,
  };
};
