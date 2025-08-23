import { create } from "zustand";

interface DocumentState {
  title: string;
  markdownContent: string;
}

// Helper function to calculate if states are equal
const areStatesEqual = (current: DocumentState, saved: DocumentState) =>
  current.title === saved.title &&
  current.markdownContent === saved.markdownContent;

interface EditorState {
  documentId: string | null;
  currentState: DocumentState;
  savedState: DocumentState;
  isSaved: boolean;
  /** Bumps whenever we switch to a new document; used to ignore late loads */
  loadVersion: number;
  /** True between beginDocumentSwitch and applyInitialContent */
  isInitializing: boolean;
  setTitle: (title: string) => void;
  setMarkdownContent: (content: string) => void;
  updateSavedState: (
    savedState: DocumentState | ((prev: DocumentState) => DocumentState)
  ) => void;
  /** Start switching to a new document. Returns the incremented loadVersion */
  beginDocumentSwitch: (id: string) => number;
  /** Apply server-fetched initial content if version & id match current */
  applyInitialContent: (args: {
    documentId: string;
    version: number;
    title: string;
    markdownContent: string;
  }) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  documentId: null,
  currentState: { title: "", markdownContent: "" },
  savedState: { title: "", markdownContent: "" },
  isSaved: true,
  loadVersion: 0,
  isInitializing: false,

  setTitle: (title) =>
    set((state) => {
      if (state.isInitializing) return state; // ignore edits until initialized
      const newCurrentState = { ...state.currentState, title };
      return {
        currentState: newCurrentState,
        isSaved: areStatesEqual(newCurrentState, state.savedState),
      };
    }),

  setMarkdownContent: (content) =>
    set((state) => {
      if (state.isInitializing) return state; // guard
      const newCurrentState = {
        ...state.currentState,
        markdownContent: content,
      };
      return {
        currentState: newCurrentState,
        isSaved: areStatesEqual(newCurrentState, state.savedState),
      };
    }),

  updateSavedState: (savedState) =>
    set((state) => {
      const newSavedState =
        typeof savedState === "function"
          ? savedState(state.savedState)
          : savedState;
      const isSaved = areStatesEqual(state.currentState, newSavedState);
      return {
        ...state,
        savedState: newSavedState,
        isSaved,
      };
    }),

  beginDocumentSwitch: (id) => {
    const newVersion = get().loadVersion + 1;
    set({
      documentId: id,
      loadVersion: newVersion,
      isInitializing: true,
      // Reset visible state to prevent saving old content into new doc.
      currentState: { title: "", markdownContent: "" },
      savedState: { title: "", markdownContent: "" },
      isSaved: true, // nothing to save yet
    });
    return newVersion;
  },

  applyInitialContent: ({ documentId, version, title, markdownContent }) => {
    const state = get();
    if (
      version !== state.loadVersion ||
      documentId !== state.documentId ||
      !state.isInitializing
    ) {
      return; // stale load or already initialized
    }
    const newDocState = { title, markdownContent };
    set({
      currentState: newDocState,
      savedState: newDocState,
      isSaved: true,
      isInitializing: false,
    });
  },
}));
