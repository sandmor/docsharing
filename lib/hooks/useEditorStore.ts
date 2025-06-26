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
  setTitle: (title: string) => void;
  setDocumentId: (id: string | null) => void;
  setMarkdownContent: (content: string) => void;
  updateSavedState: (savedState: DocumentState) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  documentId: null,
  currentState: {
    title: "",
    markdownContent: "",
  },
  savedState: {
    title: "",
    markdownContent: "",
  },
  isSaved: true,

  setTitle: (title) =>
    set((state) => {
      const newCurrentState = { ...state.currentState, title };
      return {
        currentState: newCurrentState,
        isSaved: areStatesEqual(newCurrentState, state.savedState),
      };
    }),

  setDocumentId: (id) => set({ documentId: id }),

  setMarkdownContent: (content) =>
    set((state) => {
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
      const newSavedState = { ...savedState };
      const isSaved = areStatesEqual(state.currentState, newSavedState);
      return {
        ...state,
        savedState: newSavedState,
        isSaved,
      };
    }),
}));
