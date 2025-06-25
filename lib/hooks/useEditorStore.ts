import { create } from "zustand";

interface EditorState {
  documentId: string | null;
  markdownContent: string;
  setDocumentId: (id: string | null) => void;
  setMarkdownContent: (content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  markdownContent: "",
  documentId: null,
  setDocumentId: (id: string | null) => set({ documentId: id }),
  setMarkdownContent: (content: string) => set({ markdownContent: content }),
}));
